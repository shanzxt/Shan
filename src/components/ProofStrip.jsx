import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { SPRING_SNAP } from "../lib/motion"
import { useCountUp } from "../lib/useCountUp"

// Real figures only, pulled from the portfolio-tool data and this repo's
// own engineering log — never placeholder numbers.
//   - funds analyzed / months of history: src/lib/portfolioEngine/funds_aligned.json
//   - effective N: the newsletter's headline claim (n2-Diversification/Code/CLAUDE.md)
//   - gotchas logged: n2-Diversification/Code/GOTCHAS.md
const stats = [
  { value: 45, decimals: 0, label: "funds analyzed" },
  { value: 164, decimals: 0, label: "months of NAV history" },
  { value: 2.04, decimals: 2, label: "effective independent bets, not 45" },
  { value: 25, decimals: 0, label: "engineering gotchas logged" },
]

function Stat({ stat, delay }) {
  const reduceMotion = useReducedMotion()
  const { display, onViewportEnter } = useCountUp(stat.value, { decimals: stat.decimals })

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={onViewportEnter}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.5, delay: reduceMotion ? 0 : delay, ease: "easeOut" }}
    >
      <div className="font-mono text-3xl tabular-nums text-accent sm:text-4xl">
        {stat.decimals ? display.toFixed(stat.decimals) : display}
      </div>
      <div className="mt-1 text-xs leading-snug text-paper/50 sm:text-sm">{stat.label}</div>
    </motion.div>
  )
}

export default function ProofStrip() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="border-t hr-line px-6 py-12 sm:px-10 lg:px-16">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Stat key={s.label} stat={s} delay={i * 0.06} />
        ))}
      </div>

      {/* These stats are the portfolio tool's own numbers, so the CTA into
          it lives right here rather than only in the header nav / footer —
          amber-on-dark to match the same inversion language as the footer. */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
        className="mt-10"
      >
        <Link to="/portfolio" className="group block">
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            transition={SPRING_SNAP}
            className="flex flex-col items-start justify-between gap-4 rounded-md bg-accent px-6 py-5 text-ink sm:flex-row sm:items-center sm:px-8 sm:py-6"
          >
            <div>
              <div className="font-display text-xl font-medium leading-snug sm:text-2xl">
                Build your own portfolio
              </div>
              <p className="mt-1 max-w-md font-mono text-xs text-ink/70 sm:text-sm">
                Pick ~45 Indian mutual funds, watch the correlation heatmap and eigen matrix update live.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-sm font-medium">
              Open the tool
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </motion.div>
        </Link>
      </motion.div>
    </section>
  )
}
