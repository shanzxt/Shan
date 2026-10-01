import { useEffect, useRef } from "react"
import { EASE_IN_OUT } from "../lib/motion"

// The hero's field: a WebGL layer over the whole hero with depth. Two grid
// rulings (64px fine, 256px coarse) sit at different depths and shift
// against each other with the pointer and the scroll; fine film grain sits
// on top; a soft amber glow pools behind the one key figure (`glowRef`).
//
// On arrival the grid starts as noise and resolves as an amber crest sweeps
// through (about 3s, the shared `switch` curve), then holds. After that it
// only renders when the reader acts (pointer, scroll) and eases to rest,
// so a still page costs nothing. No WebGL → it renders nothing and the CSS
// grid layers underneath are the picture. Lazy, never prerendered.

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
uniform vec2 uShift;
uniform vec2 uGlow;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x);
  float b = mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x);
  return mix(a, b, f.y) * 2.0 - 1.0;
}
float grid(vec2 q, float size) {
  vec2 g = abs(fract((q - 0.5) / size + 0.5) - 0.5) * size;
  return 1.0 - smoothstep(0.0, 1.1, min(g.x, g.y));
}

void main() {
  // CSS pixels, origin top-left
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  float d = p.x - uCrest;

  // Ahead of the crest: noise. Behind it: an underdamped ring-down (one
  // overshoot, then still), the same step response the UI uses. uCalm is
  // the remaining disturbance; it falls to zero and the grid holds.
  float behind = max(-d, 0.0) / 260.0;
  float ring = d > 0.0 ? 1.0 : exp(-2.4 * behind) * cos(4.2 * behind);
  float amp = 16.0 * ring * uCalm;
  vec2 off = amp * vec2(
    vnoise(p * 0.011 + vec2(uTime * 0.7, 0.0)),
    vnoise(p * 0.011 + vec2(17.0, uTime * 0.7))
  );

  // two depths: the coarse ruling is nearer, so it moves more
  float fine = grid(p + off + uShift * 0.35, 64.0);
  float coarse = grid(p + off * 1.4 + uShift, 256.0);
  float crest = exp(-(d * d) / (2.0 * 70.0 * 70.0)) * step(0.001, uCalm);

  float a = fine * (0.05 + 0.06 * abs(ring) * uCalm + 0.5 * crest)
          + coarse * (0.09 + 0.3 * crest)
          + crest * 0.04;

  // soft amber glow behind the key figure
  float gd = length((p - uGlow) / vec2(420.0, 260.0));
  float glow = exp(-gd * gd * 1.6) * 0.16;

  vec2 uv = p / (uRes / uDpr);
  float r = length((uv - vec2(0.6, 0.55)) * vec2(1.0, 0.9));
  a *= mix(1.0, 1.0 - smoothstep(0.25, 0.85, r), uMask);
  a += glow;

  // fine film grain, signed so it darkens as well as lifts
  float grain = (hash(floor(p * uDpr) + fract(uTime) * 91.0) - 0.5) * 0.05;
  vec3 col = vec3(1.0, 0.69, 0.0) * a + vec3(grain);
  gl_FragColor = vec4(max(col, 0.0), clamp(a + abs(grain), 0.0, 1.0));
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

export default function HeroField({ glowRef, masked = false, onReady }) {
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
    onReady?.()

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "a")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const u = Object.fromEntries(
      ["uRes", "uDpr", "uTime", "uCrest", "uCalm", "uMask", "uShift", "uGlow"].map((n) => [n, gl.getUniformLocation(prog, n)]),
    )
    const desktop = window.matchMedia("(min-width: 1024px)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, desktop ? 1.5 : 1.25)
    let W = 0
    let H = 0
    let glow = [0, 0]
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      W = r.width
      H = r.height
      canvas.width = Math.max(1, Math.round(W * dpr))
      canvas.height = Math.max(1, Math.round(H * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      const g = glowRef?.current?.getBoundingClientRect()
      glow = g ? [g.left - r.left + g.width / 2, g.top - r.top + g.height / 2] : [W * 0.75, H * 0.4]
      schedule()
    }

    let raf = 0
    let start = 0
    let shift = [0, 0]
    let target = [0, 0]
    const frame = (now) => {
      raf = 0
      if (!start) start = now
      const t = now - start
      const crest = -240 + bezier(Math.min(t / SWEEP_MS, 1), EASE_IN_OUT) * (W + 480)
      const calm = t < SWEEP_MS ? 1 : Math.max(0, 1 - (t - SWEEP_MS) / FADE_MS)
      shift = [shift[0] + (target[0] - shift[0]) * 0.08, shift[1] + (target[1] - shift[1]) * 0.08]
      gl.uniform2f(u.uRes, canvas.width, canvas.height)
      gl.uniform1f(u.uDpr, dpr)
      gl.uniform1f(u.uTime, t / 1000)
      gl.uniform1f(u.uCrest, crest)
      gl.uniform1f(u.uCalm, calm)
      gl.uniform1f(u.uMask, masked ? 1 : 0)
      gl.uniform2f(u.uShift, shift[0], shift[1])
      gl.uniform2f(u.uGlow, glow[0], glow[1])
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      // keep drawing while arriving or easing toward the pointer, then hold
      const moving = Math.abs(target[0] - shift[0]) + Math.abs(target[1] - shift[1]) > 0.1
      if (calm > 0 || moving) schedule()
    }
    function schedule() {
      if (!raf && start && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // The reader's hand and the scroll shift the layers (parallax depth).
    const section = canvas.closest("section")
    const onMove = (e) => {
      target = [(e.clientX / window.innerWidth - 0.5) * -28, (e.clientY / window.innerHeight - 0.5) * -18 + window.scrollY * 0.25]
      schedule()
    }
    const onScroll = () => {
      target = [target[0], window.scrollY * 0.25]
      schedule()
    }
    section?.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })

    // Arrive the first time the hero is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || start) return
        io.disconnect()
        raf = requestAnimationFrame((now) => {
          start = now
          frame(now)
        })
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    return () => {
      io.disconnect()
      ro.disconnect()
      section?.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [masked, glowRef, onReady])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
