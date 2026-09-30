import { useEffect } from "react"
import { motion, useReducedMotion, useSpring } from "framer-motion"
import { SETTLE } from "../../lib/motion"

// Analog readout for effective N: a needle on a scale from 1 to the number
// of funds selected, settling with the site's underdamped spring each time
// the result changes. Presentation only — it draws the value StatsPanel
// already shows; nothing is computed here.
const R = 92
const CX = 110
const CY = 106

function polar(angleDeg, radius) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)]
}

export default function EffectiveNGauge({ value, max }) {
  const reduceMotion = useReducedMotion()
  const frac = max > 1 ? Math.min(Math.max((value - 1) / (max - 1), 0), 1) : 1
  const target = -90 + frac * 180
  const angle = useSpring(target, SETTLE)

  useEffect(() => {
    if (reduceMotion) angle.jump(target)
    else angle.set(target)
  }, [angle, target, reduceMotion])

  const ticks = Math.min(Math.max(max, 2), 45)
  const [ax, ay] = polar(-90, R)
  const [bx, by] = polar(90, R)
  const [vx, vy] = polar(target, R)

  return (
    <div aria-hidden="true" className="relative mx-auto h-[118px] w-[220px]">
      <svg viewBox="0 0 220 118" className="absolute inset-0 h-full w-full overflow-visible">
        <path d={`M${ax},${ay} A${R},${R} 0 0 1 ${bx},${by}`} fill="none" className="stroke-line" strokeWidth="1" />
        <path
          d={`M${ax},${ay} A${R},${R} 0 0 1 ${vx},${vy}`}
          fill="none"
          className="stroke-accent"
          strokeWidth="3"
          style={{ filter: "drop-shadow(0 0 5px rgba(255,176,0,.7))" }}
        />
        {Array.from({ length: ticks }).map((_, i) => {
          const a = -90 + (i / (ticks - 1)) * 180
          const [x1, y1] = polar(a, R + 5)
          const [x2, y2] = polar(a, R + (i === 0 || i === ticks - 1 ? 13 : 9))
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-paper/35" strokeWidth="1" />
        })}
        <text x={CX - R} y={CY + 12} textAnchor="middle" className="fill-paper/55" style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}>
          1
        </text>
        <text x={CX + R} y={CY + 12} textAnchor="middle" className="fill-paper/55" style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}>
          {max}
        </text>
      </svg>
      <motion.div
        className="absolute bottom-[12px] left-1/2 h-[84px] w-[2px] origin-bottom -translate-x-1/2 bg-paper shadow-[0_0_8px_rgba(235,231,220,0.6)]"
        style={{ rotate: angle }}
      />
      <span className="absolute bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-accent bg-bg" />
    </div>
  )
}
