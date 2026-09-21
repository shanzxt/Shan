import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, BookOpen } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import ClipReveal from "./ClipReveal"
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

export default function IssueCard({ issue, onOpen }) {
  const reduceMotion = useReducedMotion()
  const data = toChartData(issue.chart)

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="border hr-line bg-paper/[0.03] p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-xs text-teal">Issue {issue.number}</span>
        <span className="font-mono text-xs text-paper/40">{issue.date}</span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(issue.id)}
        className="mt-3 text-left font-display text-2xl font-medium leading-snug text-paper transition-colors hover:text-accent sm:text-3xl"
      >
        {issue.title}
      </button>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-paper/70">{issue.hook}</p>

      <ClipReveal className="mt-6 h-64 w-full" margin="-40px">
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
      </ClipReveal>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs">
        {issue.chart.series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-paper/60">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
            {s.label} — {s.multiple}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t hr-line pt-5 sm:grid-cols-4">
        {issue.stats.map((s) => (
          <div key={s.label}>
            <div className="font-mono text-lg text-paper sm:text-xl">{s.value}</div>
            <div className="mt-0.5 text-xs text-paper/50">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm">
        <button
          type="button"
          onClick={() => onOpen(issue.id)}
          className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 font-medium text-ink transition-opacity hover:opacity-85"
        >
          <BookOpen size={15} />
          Read the issue
        </button>
        <a
          href={issue.substackUrl}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 text-paper/60 transition-colors hover:text-accent"
        >
          Open on Substack
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
  )
}
