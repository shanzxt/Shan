import { useEffect, useMemo, useRef, useState } from "react"
import { getLenis } from "../lib/scroll"
import { driveWithGsap } from "../lib/ticker"
import { useReducedMotionPref } from "../lib/env"
import SettleReadout from "./SettleReadout"

// Replay of one chart series, scrubbed by scroll: the curve draws itself
// across the years and the readouts settle at each sampled mark. Every
// figure is the issue's own data (`chart.series[].values`, `invested`);
// nothing between marks is interpolated into a readout. GSAP +
// ScrollTrigger are fetched only when this mounts. First paint and
// reduced motion get the finished state: full curve, final readings.

const VB_W = 1000
const VB_H = 520
const PAD = { top: 28, bottom: 36, left: 8, right: 8 }

// Monotone cubic (Fritsch–Carlson) so the curve never dips between
// samples the way a plain spline would.
function monotone(xs, ys) {
  const n = xs.length
  const d = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]))
  const m = [d[0], ...d.slice(1).map((v, i) => (v * d[i] <= 0 ? 0 : (v + d[i]) / 2)), d[n - 2]]
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0
      continue
    }
    const a = m[i] / d[i]
    const b = m[i + 1] / d[i]
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[i] = t * a * d[i]
      m[i + 1] = t * b * d[i]
    }
  }
  return (x) => {
    let i = Math.min(n - 2, Math.max(0, xs.findIndex((v, k) => x <= xs[k + 1])))
    const h = xs[i + 1] - xs[i]
    const t = (x - xs[i]) / h
    const t2 = t * t
    const t3 = t2 * t
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
    )
  }
}

// ₹ in lakh → the same notation as the issue's stat callouts (₹42.1L, ₹4.72Cr)
const rupees = (lakh) => (lakh >= 100 ? `₹${(lakh / 100).toFixed(2)}Cr` : `₹${lakh.toFixed(1)}L`)

export default function CompoundingScrub({ chart, seriesKey }) {
  const series = chart.series.find((s) => s.key === seriesKey)
  const { years } = chart
  const reduced = useReducedMotionPref()
  const [scrubbing, setScrubbing] = useState(false)
  const [mark, setMark] = useState(years.length - 1)

  const sectionRef = useRef(null)
  const clipRef = useRef(null)
  const tipRef = useRef(null)

  const first = years[0]
  const span = years[years.length - 1] - first
  const max = series.values[series.values.length - 1]
  const x = (year) => PAD.left + ((year - first) / span) * (VB_W - PAD.left - PAD.right)
  const y = (v) => VB_H - PAD.bottom - (v / max) * (VB_H - PAD.top - PAD.bottom)

  const { path, f } = useMemo(() => {
    const curve = monotone(years, series.values)
    const pts = Array.from({ length: 141 }, (_, k) => first + (span * k) / 140)
    return {
      f: curve,
      path: pts.map((yr, k) => `${k ? "L" : "M"}${x(yr).toFixed(1)},${y(curve(yr)).toFixed(1)}`).join(""),
    }
  }, [series])

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    let tween
    let offLenis

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !sectionRef.current) return
      gsap.registerPlugin(ScrollTrigger)
      driveWithGsap(gsap)
      offLenis = getLenis()?.on("scroll", ScrollTrigger.update)
      setScrubbing(true)

      const state = { p: 0 }
      const draw = () => {
        const year = first + state.p * span
        clipRef.current?.setAttribute("width", String(x(year)))
        tipRef.current?.setAttribute("transform", `translate(${x(year)} ${y(f(year))})`)
        // the reading holds at the last sampled mark the trace has passed
        let i = 0
        while (i < years.length - 1 && years[i + 1] <= year + 1e-6) i++
        setMark(i)
      }
      // wait a frame so the section has its scrub height before measuring
      requestAnimationFrame(() => {
        if (cancelled) return
        tween = gsap.to(state, {
          p: 1,
          ease: "none",
          onUpdate: draw,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 12%",
            end: "bottom bottom",
            scrub: 0.6,
          },
        })
        draw()
      })
    })

    return () => {
      cancelled = true
      offLenis?.()
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [reduced, f])

  const year = years[mark]
  const corpus = series.values[mark]
  // flat contributions accrue linearly, so invested-to-date is the issue's
  // total invested pro-rated by elapsed years
  const invested = (series.invested * (year - first)) / span

  return (
    <section
      ref={sectionRef}
      aria-label={`Replay: ${series.label}, ${first}–${years[years.length - 1]}`}
      className={`relative my-14 print:hidden ${scrubbing ? "h-[240vh]" : ""}`}
    >
      <div className={`panel graticule relative p-4 sm:p-6 ${scrubbing ? "sticky top-[12vh]" : ""}`}>
        <div className="flex items-center justify-between gap-4">
          <p className="readout text-paper/60">
            <span className="text-accent">CH-R</span> · Replay
          </p>
          <p className="readout text-paper/60">
            {series.label} · {first}–{years[years.length - 1]}
          </p>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line py-4 sm:grid-cols-4">
          {[
            ["Year", String(year)],
            ["Invested", rupees(invested)],
            ["Corpus", rupees(corpus)],
            ["Multiple", invested > 0 ? `${(corpus / invested).toFixed(1)}x` : "—"],
          ].map(([label, value], i) => (
            <div key={label}>
              <dt className="readout text-paper/60">{label}</dt>
              <dd className={`mt-1 font-mono text-xl sm:text-2xl ${i === 2 ? "text-accent glow" : "text-paper"}`}>
                <SettleReadout value={value} />
              </dd>
            </div>
          ))}
        </dl>

        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="mt-4 block h-auto w-full" aria-hidden="true">
          <defs>
            <clipPath id="scrub-clip">
              <rect ref={clipRef} x="0" y="0" width={VB_W} height={VB_H} />
            </clipPath>
          </defs>
          {years.map((yr, i) => (
            <g key={yr}>
              <line
                x1={x(yr)}
                x2={x(yr)}
                y1={PAD.top}
                y2={VB_H - PAD.bottom}
                stroke={i <= mark ? "var(--color-accent)" : "var(--color-paper)"}
                strokeOpacity={i <= mark ? 0.35 : 0.1}
                strokeDasharray="3 5"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
          <path d={path} fill="none" stroke="var(--color-paper)" strokeOpacity="0.12" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path
            d={path}
            clipPath="url(#scrub-clip)"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.25"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 0 5px var(--color-accent))" }}
          />
          <g ref={tipRef} transform={`translate(${x(years[years.length - 1])} ${y(max)})`}>
            <circle r="6" fill="var(--color-accent)" />
          </g>
        </svg>
        {/* axis labels as HTML so they stay legible at 390px */}
        <div className="relative -mt-2 h-4" aria-hidden="true">
          {years.map((yr, i) => (
            <span
              key={yr}
              className={`readout absolute top-0 tabular-nums ${i <= mark ? "text-paper/70" : "text-paper/40"}`}
              style={{
                left: `${(x(yr) / VB_W) * 100}%`,
                transform: `translateX(${i === 0 ? "0" : i === years.length - 1 ? "-100%" : "-50%"})`,
              }}
            >
              {i === 0 || i === years.length - 1 ? yr : `’${String(yr).slice(2)}`}
            </span>
          ))}
        </div>

        {scrubbing && <p className="readout mt-3 text-paper/60">Scroll to run it · readings at each 5-year mark</p>}
      </div>
    </section>
  )
}
