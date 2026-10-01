import { motion, useReducedMotion } from "framer-motion"
import { isInitialLoad } from "../lib/firstLoad"
import { EASE_OUT } from "../lib/motion"
import { seriesPath } from "../lib/series"

// A filing's trace: the issue's own series drawn small. Lines draw on as
// they arrive; bar spectra rise in order. The values are in the label for
// screen readers, so the drawing itself stays decorative.
const W = 160
const H = 48

export default function Sparkline({ spark, className = "" }) {
  // Prerendered first paint shows the finished trace; it only draws on
  // after a client-side navigation.
  const still = useReducedMotion() || isInitialLoad()
  const max = Math.max(...spark.values)
  const summary = `${spark.label}: ${spark.values.join(", ")}${spark.unit === "%" ? "%" : ` (${spark.unit})`}`

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-12 w-full overflow-visible" role="img" aria-label={summary}>
        <line x1="0" x2={W} y1={H} y2={H} stroke="rgba(235,231,220,0.18)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {spark.kind === "bars"
          ? spark.values.map((v, i) => {
              const bw = W / spark.values.length
              const h = Math.max((v / max) * H, 1.5)
              return (
                <motion.rect
                  key={i}
                  x={i * bw + 2}
                  width={bw - 4}
                  y={H - h}
                  height={h}
                  fill={i ? "rgba(235,231,220,0.45)" : "var(--color-accent)"}
                  style={{ transformOrigin: `0 ${H}px`, transformBox: "view-box" }}
                  initial={still ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.06 }}
                />
              )
            })
          : (
            <motion.path
              d={seriesPath(spark.values, W, H, max)}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.75"
              vectorEffect="non-scaling-stroke"
              initial={still ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 1.4, ease: EASE_OUT }}
            />
          )}
      </svg>
      <figcaption className="engraved mt-2 text-paper/60">{spark.label}</figcaption>
    </figure>
  )
}
