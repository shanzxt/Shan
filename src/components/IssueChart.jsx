import { useReducedMotion } from "framer-motion"
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

// Split from IssueContent.jsx so the article body doesn't carry Recharts;
// NewsletterIssue lazy-loads this only for issues that have a `chart`.

export function toChartData(chart) {
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

// Issue 1 has a live Recharts time series masthead; issues without one
// (e.g. issue 2's correlation study) have no masthead visual here — their
// first content block is already an image, so nothing is skipped.
export default function IssueChart({ issue }) {
  const reduceMotion = useReducedMotion()

  if (!issue.chart) return null

  const data = toChartData(issue.chart)

  return (
    <>
      <ClipReveal className="mt-8 h-64 w-full" duration={0.7} amount={0}>
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
    </>
  )
}
