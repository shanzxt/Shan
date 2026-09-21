import { motion, useReducedMotion } from "framer-motion"
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
      viewport={{ once: true, margin: "-80px" }}
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
  return (
    <section className="border-t hr-line px-6 py-12 sm:px-10 lg:px-16">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Stat key={s.label} stat={s} delay={i * 0.06} />
        ))}
      </div>
    </section>
  )
}
