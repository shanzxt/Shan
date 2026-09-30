import { useEffect, useRef } from "react"
import { useReducedMotionPref } from "../lib/env"

// A dead channel's flatline that twitches when the probe moves near it,
// then decays back to flat and stops animating (no idle loop). Static
// flat line under reduced motion.
const POINTS = 140

export default function Flatline({ className = "" }) {
  const reduced = useReducedMotionPref()
  const pathRef = useRef(null)

  useEffect(() => {
    if (reduced) return
    const path = pathRef.current
    const host = path?.ownerSVGElement?.parentElement
    if (!path || !host) return
    let amp = 0
    let px = 0.5
    let raf = 0
    let frame = 0

    const draw = () => {
      frame++
      let d = ""
      for (let i = 0; i <= POINTS; i++) {
        const t = i / POINTS
        const near = Math.exp(-(((t - px) / 0.12) ** 2))
        const n = Math.sin(i * 12.9898 + frame * 0.9) * 43758.5453
        const y = 50 + (n - Math.floor(n) - 0.5) * 2 * amp * (0.25 + near)
        d += `${i ? "L" : "M"}${(t * 1000).toFixed(1)},${y.toFixed(2)}`
      }
      path.setAttribute("d", d)
      amp *= 0.93
      if (amp > 0.2) raf = requestAnimationFrame(draw)
      else {
        path.setAttribute("d", "M0,50 L1000,50")
        raf = 0
      }
    }
    const onMove = (e) => {
      const r = host.getBoundingClientRect()
      px = (e.clientX - r.left) / r.width
      amp = Math.min(amp + 6, 34)
      if (!raf) raf = requestAnimationFrame(draw)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <div aria-hidden="true" className={className}>
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <path
          ref={pathRef}
          d="M0,50 L1000,50"
          fill="none"
          stroke="var(--color-alarm)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 6px rgba(255,91,58,.7))" }}
        />
      </svg>
    </div>
  )
}
