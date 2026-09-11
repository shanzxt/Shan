import { useEffect, useRef } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, X } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import GithubMark from "./icons/GithubMark"

function toChartData(chart) {
  return chart.years.map((year, i) => {
    const row = { year }
    for (const s of chart.series) row[s.key] = s.values[i]
    return row
  })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="border hr-line bg-bg px-3 py-2 font-mono text-xs">
      <div className="mb-1 text-paper/50">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          ₹{p.value}L
        </div>
      ))}
    </div>
  )
}

function Block({ block }) {
  switch (block.type) {
    case "h2":
      return (
        <h3 className="mt-8 font-display text-xl font-medium text-paper first:mt-0 sm:text-2xl">
          {block.text}
        </h3>
      )
    case "quote":
      return (
        <blockquote className="mt-6 border-l-2 border-accent pl-4 font-display text-lg italic leading-snug text-paper/90 sm:text-xl">
          {block.text}
        </blockquote>
      )
    case "list":
      return (
        <ul className="mt-4 flex flex-col gap-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-paper/70">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      )
    case "p":
    default:
      return <p className="mt-4 text-[15px] leading-relaxed text-paper/70 first:mt-0">{block.text}</p>
  }
}

export default function IssueModal({ issue, onClose }) {
  const reduceMotion = useReducedMotion()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!issue) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [issue, onClose])

  const data = issue ? toChartData(issue.chart) : null

  return (
    <AnimatePresence>
      {issue && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bg/90 px-4 py-10 backdrop-blur-sm sm:px-6 sm:py-16"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-label={issue.title}
        >
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-2xl border hr-line bg-bg p-6 sm:p-10"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center text-paper/50 transition-colors hover:text-accent sm:right-6 sm:top-6"
            >
              <X size={18} />
            </button>

            <div className="flex flex-wrap items-baseline justify-between gap-2 pr-10">
              <span className="font-mono text-xs text-teal">Issue {issue.number}</span>
              <span className="font-mono text-xs text-paper/40">{issue.date}</span>
            </div>

            <h2 className="mt-3 max-w-xl font-display text-2xl font-medium leading-snug text-paper sm:text-3xl">
              {issue.title}
            </h2>

            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--color-line)" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: "rgba(237,234,226,0.5)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    axisLine={{ stroke: "var(--color-line)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(237,234,226,0.5)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-line)" }} />
                  {issue.chart.series.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                      isAnimationActive={!reduceMotion}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs">
              {issue.chart.series.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5 text-paper/60">
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                  {s.label} — {s.multiple}
                </div>
              ))}
            </div>

            <div className="mt-8 border-t hr-line pt-8">
              {issue.content?.map((block, i) => <Block key={i} block={block} />)}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t hr-line pt-6 font-mono text-sm">
              <a
                href={issue.substackUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
              >
                Read on Substack
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href={issue.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
              >
                <GithubMark size={14} />
                View the code
              </a>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
