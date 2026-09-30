import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion"

// The issue page's scroll-progress motif: a strip-chart recorder. A pen
// records a trace down the strip as you read; ticks mark where each
// section actually starts in the article; the readout shows percent read.
const H = 360
const W = 56
const POINTS = 120

function penX(t) {
  // deterministic wobble — a live recording, not a ruler line
  return W / 2 + Math.sin(t * 41) * 5 + Math.sin(t * 13.7) * 7 + Math.sin(t * 97) * 2
}

export default function ReadingRecorder({ targetRef, headingIds }) {
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start 30%", "end 70%"] })
  const readRef = useRef(null)
  const [marks, setMarks] = useState([])

  const path = useMemo(() => {
    let d = ""
    for (let i = 0; i <= POINTS; i++) {
      const t = i / POINTS
      d += `${i ? "L" : "M"}${penX(t).toFixed(1)},${(t * H).toFixed(1)}`
    }
    return d
  }, [])

  const clip = useTransform(scrollYProgress, (p) => `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0)`)
  const headY = useTransform(scrollYProgress, (p) => p * H)
  const headX = useTransform(scrollYProgress, (p) => penX(p))

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (readRef.current) readRef.current.textContent = `${String(Math.round(p * 100)).padStart(2, "0")}%`
  })

  // section ticks at the headings' real positions within the article
  useEffect(() => {
    const measure = () => {
      const article = targetRef.current
      if (!article) return
      const top = article.getBoundingClientRect().top + window.scrollY
      const height = article.offsetHeight
      setMarks(
        headingIds
          .map((id) => document.getElementById(id))
          .filter(Boolean)
          .map((el) => (el.getBoundingClientRect().top + window.scrollY - top) / height),
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (targetRef.current) ro.observe(targetRef.current)
    return () => ro.disconnect()
  }, [targetRef, headingIds])

  return (
    <div aria-hidden="true" className="sticky top-28 flex flex-col items-center print:hidden">
      <p className="readout flex items-center gap-1.5 text-paper/60">
        <span className="led" style={{ background: "var(--color-alarm)", boxShadow: "0 0 8px var(--color-alarm)" }} />
        Rec
      </p>
      <div className="panel graticule relative mt-3" style={{ width: W, height: H }}>
        <svg width={W} height={H} className="absolute inset-0 overflow-visible">
          {marks.map((m, i) => (
            <g key={i}>
              <line x1="0" x2="10" y1={m * H} y2={m * H} className="stroke-accent/70" />
              <text x={W + 6} y={m * H + 3} className="fill-paper/50 font-mono text-[9px]">
                §{String(i + 1).padStart(2, "0")}
              </text>
            </g>
          ))}
          <path d={path} fill="none" className="stroke-paper/10" strokeWidth="1" />
          <motion.path
            d={path}
            fill="none"
            className="stroke-accent"
            strokeWidth="1.5"
            style={{ clipPath: clip, filter: "drop-shadow(0 0 4px rgba(255,176,0,.7))" }}
          />
          <motion.circle r="3.5" className="fill-accent" style={{ cx: headX, cy: headY }} />
        </svg>
      </div>
      <p ref={readRef} className="readout mt-3 tabular-nums text-accent">
        00%
      </p>
    </div>
  )
}
