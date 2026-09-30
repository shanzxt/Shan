import { useEffect, useRef, useSyncExternalStore } from "react"
import { useReducedMotionPref } from "../lib/env"

// XY-mode oscilloscope for the footer: x = sin(a·t + δ), y = sin(b·t).
// The probe position picks the frequency ratio a:b (1–5 : 1–4), the phase
// δ drifts so the figure turns, and the ratio glides rather than jumps.
// Idle, it cycles through a few ratios. Paused off-screen; reduced motion
// gets a static 3:2 figure. `ratioRef` (optional) receives the live a:b
// ratio as text, written directly from the loop.
const IDLE_RATIOS = [
  [3, 2],
  [5, 4],
  [1, 2],
  [3, 4],
  [5, 2],
]

const subscribeNoop = () => () => {}
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )

function staticPath(a, b, w, h, n = 400) {
  let d = ""
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2
    const x = w / 2 + Math.sin(a * t + Math.PI / 4) * w * 0.42
    const y = h / 2 + Math.sin(b * t) * h * 0.42
    d += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`
  }
  return d
}

export default function Lissajous({ className = "", ratioRef }) {
  const isClient = useIsClient()
  const reduced = useReducedMotionPref()
  const live = isClient && !reduced
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!live) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const host = canvas.parentElement
    const zone = canvas.closest("[data-xy-zone]") ?? host
    let W = 0
    let H = 0
    const measure = () => {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(host)

    let a = 3
    let b = 2
    let ta = 3
    let tb = 2
    let delta = 0
    let pointerActive = false
    let idleIndex = 0
    let lastSwitch = 0
    let lastReported = ""
    let raf = 0
    let running = false

    const onMove = (e) => {
      const r = zone.getBoundingClientRect()
      const px = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 0.999)
      const py = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 0.999)
      ta = 1 + Math.floor(px * 5)
      tb = 1 + Math.floor(py * 4)
      pointerActive = true
    }
    const onLeave = () => (pointerActive = false)
    zone.addEventListener("pointermove", onMove, { passive: true })
    zone.addEventListener("pointerleave", onLeave)

    const draw = (time) => {
      if (!pointerActive && time - lastSwitch > 4200) {
        lastSwitch = time
        ;[ta, tb] = IDLE_RATIOS[idleIndex++ % IDLE_RATIOS.length]
      }
      a += (ta - a) * 0.05
      b += (tb - b) * 0.05
      delta += 0.006

      const label = `${ta}:${tb}`
      if (label !== lastReported) {
        lastReported = label
        if (ratioRef?.current) ratioRef.current.textContent = label
      }

      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0,0,0,0.22)"
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = "source-over"

      const n = 520
      const rx = W * 0.44
      const ry = H * 0.42
      ctx.beginPath()
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * Math.PI * 2
        const x = W / 2 + Math.sin(a * t + delta) * rx
        const y = H / 2 + Math.sin(b * t) * ry
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      ctx.strokeStyle = "rgba(255,176,0,0.12)"
      ctx.lineWidth = 8
      ctx.stroke()
      ctx.strokeStyle = "rgba(255,196,80,0.9)"
      ctx.lineWidth = 1.6
      ctx.stroke()
    }

    const loop = (time) => {
      raf = requestAnimationFrame(loop)
      draw(time)
    }
    const start = () => {
      if (running || document.hidden) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 })
    io.observe(host)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVis)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      zone.removeEventListener("pointermove", onMove)
      zone.removeEventListener("pointerleave", onLeave)
    }
  }, [live, ratioRef])

  return (
    <div aria-hidden="true" className={className || "relative"}>
      {live ? (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      ) : (
        <svg viewBox="0 0 400 400" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path
            d={staticPath(3, 2, 400, 400)}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
            opacity="0.85"
          />
        </svg>
      )}
    </div>
  )
}
