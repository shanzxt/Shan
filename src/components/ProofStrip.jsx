import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { EASE_OUT } from "../lib/motion"
import { useCountUp } from "../lib/useCountUp"
import TransitionLink from "./chrome/TransitionLink"
import Magnetic from "./Magnetic"
import SectionHeader from "./SectionHeader"

// Real figures only, pulled from the portfolio-tool data and this repo's
// own engineering log — never placeholder numbers.
//   - funds analyzed / months of history: src/lib/portfolioEngine/funds_aligned.json
//   - effective N: the newsletter's headline claim (n2-Diversification/Code/CLAUDE.md)
//   - gotchas logged: n2-Diversification/Code/GOTCHAS.md
// `scale` is how many ticks the meter draws: each count lights one tick
// per unit; effective bets is drawn against the 45 funds it came from.
const stats = [
  { value: 45, decimals: 0, label: "funds analyzed", scale: 45 },
  { value: 164, decimals: 0, label: "months of NAV history", scale: 164 },
  { value: 2.04, decimals: 2, label: "effective independent bets, not 45", scale: 45, highlight: true },
  { value: 25, decimals: 0, label: "engineering gotchas logged", scale: 25 },
]

function TickMeter({ scale, lit, highlight }) {
  return (
    <div aria-hidden="true" className="mt-5 flex flex-wrap gap-[3px]">
      {Array.from({ length: scale }).map((_, i) => {
        const on = i < Math.floor(lit)
        const partial = !on && i < lit
        return (
          <span
            key={i}
            className={`h-2 w-[3px] transition-colors duration-150 sm:h-3 ${
              on ? (highlight ? "bg-accent shadow-phosphor" : "bg-teal") : partial ? "bg-accent/40" : "bg-paper/12"
            }`}
          />
        )
      })}
    </div>
  )
}

function Stat({ stat, index }) {
  const reduceMotion = useReducedMotion()
  const { display, onViewportEnter } = useCountUp(stat.value, { decimals: stat.decimals, duration: 1.8 })

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={onViewportEnter}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.6, delay: reduceMotion ? 0 : index * 0.08, ease: EASE_OUT }}
      className={`relative border-line p-5 sm:p-7 ${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b lg:border-b-0" : ""} lg:border-r lg:last:border-r-0`}
    >
      <div className="flex items-center justify-between">
        <span className="readout text-paper/50">M-{String(index + 1).padStart(2, "0")}</span>
        {stat.highlight && <span className="led" aria-hidden="true" />}
      </div>
      <div
        className={`mt-4 font-display text-5xl font-[800] leading-none tabular-nums tracking-tight [font-stretch:80%] sm:text-6xl lg:text-7xl ${
          stat.highlight ? "text-accent glow" : "text-paper"
        }`}
      >
        {stat.decimals ? display.toFixed(stat.decimals) : display}
      </div>
      <div className="mt-2 font-mono text-[12px] leading-snug text-paper/65">{stat.label}</div>
      <TickMeter scale={stat.scale} lit={display} highlight={stat.highlight} />
    </motion.div>
  )
}

export default function ProofStrip() {
  const reduceMotion = useReducedMotion()

  return (
    <section aria-label="Measurements" className="mx-auto max-w-[1600px] px-5 pb-8 pt-20 sm:px-8 lg:px-12 lg:pb-12 lg:pt-28">
      <SectionHeader channel="CH-02" label="measurements" />

      <div className="panel relative mt-10 grid grid-cols-2 lg:grid-cols-4">
        {/* rack screws */}
        {["left-2 top-2", "right-2 top-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-paper/15`} />
        ))}
        {stats.map((s, i) => (
          <Stat key={s.label} stat={s} index={i} />
        ))}
      </div>

      {/* These stats are the portfolio tool's own numbers, so the CTA into
          it lives right here — the same amber inversion as the footer band. */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.2, ease: EASE_OUT }}
        className="on-accent mt-4"
      >
        <TransitionLink
          to="/portfolio"
          data-cursor="lock"
          className="group relative flex flex-col items-start justify-between gap-5 overflow-hidden bg-accent px-6 py-6 text-ink sm:flex-row sm:items-center sm:px-8 sm:py-7"
        >
          {/* scanline sweep on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-0 origin-left scale-x-0 bg-paper/25 transition-transform duration-500 ease-sweep group-hover:scale-x-100"
          />
          <div className="relative">
            <div className="font-display text-2xl font-[800] uppercase leading-none tracking-tight [font-stretch:85%] sm:text-4xl">
              Build your own portfolio
            </div>
            <p className="mt-2 max-w-md font-mono text-[12px] leading-relaxed text-ink/75 sm:text-[13px]">
              Pick ~45 Indian mutual funds, watch the correlation heatmap and eigen matrix update live.
            </p>
          </div>
          <Magnetic className="relative shrink-0">
            <span className="inline-flex items-center gap-2 border border-ink/30 px-4 py-2.5 font-mono text-[13px] font-medium">
              Open the tool
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Magnetic>
        </TransitionLink>
      </motion.div>
    </section>
  )
}
