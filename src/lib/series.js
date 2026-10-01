// Drawing helpers for real data series (the hero curve, issue sparklines).
// The values come straight from src/data/newsletter.js; these only decide
// how to draw a smooth line through them and how to print them.

// Monotone cubic (Fritsch–Carlson) through evenly spaced points: smooth,
// never overshoots between samples, so the line can't invent a dip or a
// peak the data doesn't have. Returns f(t) for t in [0, 1], in data units.
export function monotone(values) {
  const n = values.length
  if (n < 2) return () => values[0] ?? 0
  const d = values.slice(1).map((v, i) => v - values[i])
  const m = values.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2))
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0
      m[i + 1] = 0
      continue
    }
    const a = m[i] / d[i]
    const b = m[i + 1] / d[i]
    const s = a * a + b * b
    if (s > 9) {
      const k = 3 / Math.sqrt(s)
      m[i] = k * a * d[i]
      m[i + 1] = k * b * d[i]
    }
  }
  return (t) => {
    const x = Math.min(Math.max(t, 0), 1) * (n - 1)
    const i = Math.min(Math.floor(x), n - 2)
    const h = x - i
    const h2 = h * h
    const h3 = h2 * h
    return (
      (2 * h3 - 3 * h2 + 1) * values[i] +
      (h3 - 2 * h2 + h) * m[i] +
      (-2 * h3 + 3 * h2) * values[i + 1] +
      (h3 - h2) * m[i + 1]
    )
  }
}

// SVG path for a series inside a w×h box, y scaled to [0, max].
export function seriesPath(values, w, h, max = Math.max(...values), points = 96) {
  const f = monotone(values)
  let d = ""
  for (let i = 0; i <= points; i++) {
    const t = i / points
    d += `${i ? "L" : "M"}${(t * w).toFixed(1)},${(h - (f(t) / max) * h).toFixed(1)}`
  }
  return d
}

// Lakh → the way the issue prints it: ₹8.6L below a crore, ₹1.21Cr above.
export function formatLakh(v) {
  return v >= 100 ? `₹${(v / 100).toFixed(2)}Cr` : `₹${v}L`
}

// The series an issue's sparkline draws: its own `spark` if it has one,
// otherwise the first series of its chart (Day 29: the flat SIP corpus).
export function issueSpark(issue) {
  if (issue.spark) return issue.spark
  const s = issue.chart?.series?.[0]
  if (!s) return null
  const { years } = issue.chart
  return { label: `${s.label} · ${years[0]}–${years.at(-1)}`, unit: "₹ lakh", kind: "line", values: s.values }
}
