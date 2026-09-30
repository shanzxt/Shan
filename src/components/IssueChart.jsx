import { useRef } from "react"
import { useInView, useReducedMotion } from "framer-motion"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Recharts lives in this chunk only (lazy-loaded by NewsletterIssue and
// IssueCard). Charts are drawn as phosphor traces on a graticule and only
// mount once scrolled into view, so the lines draw themselves where the
// reader can see them.

export function toChartData(chart) {
  return chart.years.map((year, i) => {
    const row = { year }
    for (const s of chart.series) row[s.key] = s.values[i]
    return row
  })
}

const tick = { fill: "rgba(235,231,220,0.62)", fontSize: 10, fontFamily: "var(--font-mono)" }

function ScopeTooltip({ active, payload, label, series }) {
  if (!active || !payload?.length) return null
  return (
    <div className="panel px-3 py-2 font-mono text-[11px]">
      <div className="readout mb-1 text-paper/60">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="text-paper/60">{series.find((s) => s.key === p.dataKey)?.label}</span>
          <span className="tabular-nums">₹{p.value}L</span>
        </div>
      ))}
    </div>
  )
}

export function SignalChart({ chart }) {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0 })
  const data = toChartData(chart)

  return (
    <div ref={ref} data-cursor="probe" className="h-full w-full">
      {(inView || reduceMotion) && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(255,176,0,0.08)" />
            <XAxis dataKey="year" tick={tick} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} />
            <YAxis tick={tick} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `₹${v}L`} />
            <Tooltip
              content={<ScopeTooltip series={chart.series} />}
              cursor={{ stroke: "var(--color-teal)", strokeDasharray: "3 3" }}
            />
            {chart.series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 4, stroke: "var(--color-bg)", strokeWidth: 2 }}
                isAnimationActive={!reduceMotion}
                animationDuration={1700}
                animationBegin={i * 220}
                animationEasing="ease-out"
                style={{ filter: `drop-shadow(0 0 5px ${s.color})` }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function ChartLegend({ chart, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px] ${className}`}>
      {chart.series.map((s) => (
        <div key={s.key} className="flex items-center gap-2 text-paper/70">
          <span className="inline-block h-0.5 w-4" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
          {s.label} — {s.multiple}
        </div>
      ))}
    </div>
  )
}

// Issue 1 has a live Recharts time series masthead; issues without one
// (e.g. issue 2's correlation study) have no masthead visual here — their
// first content block is already an image, so nothing is skipped.
export default function IssueChart({ issue }) {
  if (!issue.chart) return null

  return (
    <figure className="my-10">
      <div className="panel graticule relative h-64 p-3 sm:h-80 sm:p-4">
        <span className="readout absolute right-3 top-2 text-paper/45" aria-hidden="true">
          scope · ₹ lakh / year
        </span>
        <SignalChart chart={issue.chart} />
      </div>
      <ChartLegend chart={issue.chart} className="mt-3" />
    </figure>
  )
}
