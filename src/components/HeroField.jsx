import { useEffect, useRef } from "react"
import { EASE_IN_OUT } from "../lib/motion"

// The hero's arrival: a WebGL field where the graticule starts as noise
// and resolves into the calm 64px grid as an amber crest sweeps through
// it, like a market signal settling. It runs once (about 3s), lands
// exactly on the CSS `.graticule` lines underneath, fades to transparent
// and stops drawing. If WebGL is unavailable it renders nothing and the
// static graticule is the picture. Lazy-loaded by Hero, never prerendered.

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

// Colours are the Phosphor tokens as linear floats (shader code can't read
// CSS variables): accent #ffb000 = (1.0, 0.69, 0.0).
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uCrest;
uniform float uCalm;
uniform float uMask;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x);
  float b = mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x);
  return mix(a, b, f.y) * 2.0 - 1.0;
}

void main() {
  // CSS pixels, origin top-left, so the lines match the CSS graticule
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  float d = p.x - uCrest;

  // Ahead of the crest: full noise. Behind it: an underdamped ring-down
  // (one overshoot, then still), the same step response the UI uses.
  float behind = max(-d, 0.0) / 260.0;
  float ring = d > 0.0 ? 1.0 : exp(-2.4 * behind) * cos(4.2 * behind);
  float amp = 16.0 * ring * uCalm;
  vec2 off = amp * vec2(
    vnoise(p * 0.011 + vec2(uTime * 0.7, 0.0)),
    vnoise(p * 0.011 + vec2(17.0, uTime * 0.7))
  );
  vec2 q = p + off;

  // distance to the nearest 64px grid line, in CSS px
  vec2 g = abs(fract((q - 0.5) / 64.0 + 0.5) - 0.5) * 64.0;
  float line = 1.0 - smoothstep(0.0, 1.1, min(g.x, g.y));

  float crest = exp(-(d * d) / (2.0 * 70.0 * 70.0));
  float a = line * (0.06 * abs(ring) + 0.55 * crest) * uCalm + crest * 0.035 * uCalm;

  // desktop: same radial fade as the section graticule
  vec2 uv = p / (uRes / uDpr);
  float r = length((uv - vec2(0.4, 0.45)) * vec2(1.0, 0.9));
  a *= mix(1.0, 1.0 - smoothstep(0.2, 0.75, r), uMask);

  gl_FragColor = vec4(vec3(1.0, 0.69, 0.0) * a, a);
}
`

// A CSS-style cubic-bezier solved for y at x. The crest travels on the
// shared `switch` curve (0.65, 0, 0.35, 1): it eases in, crosses at an even
// pace a reader can follow, and eases out, rather than darting across.
function bezier(x, [x1, y1, x2, y2]) {
  const bx = (t) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3
  const by = (t) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (bx(mid) < x) lo = mid
    else hi = mid
  }
  return by((lo + hi) / 2)
}

const SWEEP_MS = 2800
const FADE_MS = 700

export default function HeroField({ masked = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas?.getContext("webgl", { premultipliedAlpha: true, antialias: false })
    if (!gl) return

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "a")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const u = Object.fromEntries(
      ["uRes", "uDpr", "uTime", "uCrest", "uCalm", "uMask"].map((n) => [n, gl.getUniformLocation(prog, n)]),
    )
    const desktop = window.matchMedia("(min-width: 1024px)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, desktop ? 2 : 1.5)
    let W = 0
    let H = 0
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      W = r.width
      H = r.height
      canvas.width = Math.max(1, Math.round(W * dpr))
      canvas.height = Math.max(1, Math.round(H * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()

    let raf = 0
    let start = 0
    const frame = (now) => {
      if (!start) start = now
      const t = now - start
      const crest = -240 + bezier(Math.min(t / SWEEP_MS, 1), EASE_IN_OUT) * (W + 480)
      const calm = t < SWEEP_MS ? 1 : Math.max(0, 1 - (t - SWEEP_MS) / FADE_MS)
      gl.uniform2f(u.uRes, canvas.width, canvas.height)
      gl.uniform1f(u.uDpr, dpr)
      gl.uniform1f(u.uTime, t / 1000)
      gl.uniform1f(u.uCrest, crest)
      gl.uniform1f(u.uCalm, calm)
      gl.uniform1f(u.uMask, masked ? 1 : 0)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      // settled: the CSS graticule underneath is the resting picture
      if (calm > 0) raf = requestAnimationFrame(frame)
    }

    // Run the sweep once, the first time the hero is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || start) return
        io.disconnect()
        raf = requestAnimationFrame(frame)
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [masked])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
