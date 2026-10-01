import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { links } from "../data/links"
import { sipScenarios } from "../data/sipScenarios"
import { hasFinePointer, isCapableDevice, useMediaQuery, useReducedMotionPref } from "../lib/env"
import { whenBootDone } from "../lib/firstLoad"
import { noise, probeFilter } from "../lib/signal"
import { formatLakh, monotone, seriesPath } from "../lib/series"
import Crosshair from "./Crosshair"
import GithubMark from "./icons/GithubMark"
import LinkedinMark from "./icons/LinkedinMark"
import Magnetic from "./Magnetic"

// CH-01. The compounding curve is the hero: the Day 29 issue's flat
// ₹10k/mo SIP on the Nifty 50, Aug 1991 – Aug 2026, drawn from its real
// five-year samples (src/data/newsletter.js) across the whole page. The
// trace arrives buried in noise, resolves, then holds; the one glowing
// thing in view is where it ends, the issue's own headline figure. Point
// at the chart (or tap and drag) and the crosshair reads the real value
// at the nearest sampled year.
//
// First paint (prerender, reduced motion) is a static, fully visible
// render: the clean curve as SVG and the name at rest. Nothing is hidden
// waiting for JS, which also keeps the h1 as an early LCP.

// The WebGL field (grid layers, grain, glow) is its own chunk, fetched only
// once the canvas goes live; the CSS grid layers are its static fallback.
const HeroField = lazy(() => import("./HeroField"))

const NAME = ["Shantanu", "Somwanshi"]
const flat = sipScenarios.series.find((s) => s.key === "flat")
const YEARS = sipScenarios.years
const Y_MAX = 500 // axis ceiling in lakh (₹5Cr), just above the ₹4.72Cr finish
const Y_TICKS = [0, 100, 200, 300, 400, 500]
const curve = monotone(flat.values)

// Snap the crosshair to the nearest real five-year sample; the line between
// samples is only a drawing aid, so it never gets a reading of its own.
function readCurve(fx) {
  const i = Math.round(fx * (YEARS.length - 1))
  const t = i / (YEARS.length - 1)
  return {
    x: t,
    y: 1 - flat.values[i] / Y_MAX,
    label: `${YEARS[i]} · ${flat.label}`,
    value: formatLakh(flat.values[i]),
  }
}

const subscribeNoop = () => () => {}
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )

function HeroLink({ href, children, primary = false }) {
  return (
    <Magnetic>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`group inline-flex h-11 items-center gap-2 px-4 font-mono text-[13px] transition-colors ${
          primary
            ? "bg-accent text-ink hover:bg-paper"
            : "border border-paper/20 bg-bg/60 text-paper backdrop-blur-sm hover:border-accent hover:text-accent"
        }`}
      >
        {children}
      </a>
    </Magnetic>
  )
}

export default function Hero() {
  const isClient = useIsClient()
  const reduced = useReducedMotionPref()
  // The canvas takes over from the static SVG only once the boot sequence
  // has lifted and the browser is idle, so first paint and the page's own
  // loading work never compete with the animation loop.
  const [armed, setArmed] = useState(false)
  const [fieldOn, setFieldOn] = useState(false)
  const live = isClient && !reduced && armed
  const wide = useMediaQuery("(min-width: 1024px)")

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    let idle = 0
    whenBootDone().then(() => {
      if (cancelled) return
      const ric = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 400))
      idle = ric(() => !cancelled && setArmed(true), { timeout: 1800 })
    })
    return () => {
      cancelled = true
      window.cancelIdleCallback?.(idle)
    }
  }, [reduced])

  const markField = useCallback(() => setFieldOn(true), [])
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const nameRef = useRef(null)
  const figureRef = useRef(null)
  const noiseReadRef = useRef(null)
  const stateReadRef = useRef(null)

  // Depth: the name drifts up faster than the chart as the page scrolls,
  // so the hero reads as layers rather than one flat sheet.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const nameY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -110])
  const chartY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 50])

  useEffect(() => {
    if (!live) return
    const canvas = canvasRef.current
    const section = sectionRef.current
    const nameEl = nameRef.current
    if (!canvas || !section || !nameEl) return
    const ctx = canvas.getContext("2d")
    const letters = [...nameEl.querySelectorAll("[data-letter]")]

    const desktop = window.matchMedia("(min-width: 1024px)").matches
    const fine = hasFinePointer()
    const samples = desktop ? (isCapableDevice() ? 320 : 200) : 120

    let W = 0
    let H = 0
    let baseWdth = 100
    let fontSize = 100
    let centers = []

    const measure = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, desktop ? 2 : 1.5)
      W = rect.width
      H = rect.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cs = getComputedStyle(nameEl)
      baseWdth = parseFloat(cs.getPropertyValue("--hero-wdth")) || 100
      fontSize = parseFloat(cs.fontSize) || 100
      // letter centres in page coordinates, measured at rest
      centers = letters.map((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY }
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(canvas.parentElement)

    // state: the trace starts noisy, resolves, then holds almost still
    let level = 0.8
    const target = 0.06
    let probe = null // pointer x as fraction of the plot width
    let probeSmooth = null
    let pointer = null // client coords, for the letter lens
    let lastScroll = window.scrollY
    let velocity = 0
    let frame = 0
    let raf = 0
    let running = false
    const letterState = letters.map(() => ({ wght: 820, wdth: baseWdth }))

    const plot = canvas.parentElement
    const onPlotMove = (e) => {
      const r = plot.getBoundingClientRect()
      probe = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1)
    }
    const onPlotLeave = () => (probe = null)
    const onPointerMove = (e) => (pointer = { x: e.clientX, y: e.clientY })
    const onPointerLeave = () => (pointer = null)
    plot.addEventListener("pointermove", onPlotMove, { passive: true })
    plot.addEventListener("pointerleave", onPlotLeave)
    section.addEventListener("pointermove", onPointerMove, { passive: true })
    section.addEventListener("pointerleave", onPointerLeave)

    const yAt = (t) => H - (curve(t) / Y_MAX) * H

    const draw = (time) => {
      frame++
      // scroll velocity → noise boost + name stretch
      const sy = window.scrollY
      velocity = velocity * 0.86 + Math.abs(sy - lastScroll) * 0.14
      lastScroll = sy
      const boost = Math.min(velocity / 30, 0.9)
      level += (target + boost - level) * 0.035

      if (probe != null) probeSmooth = probeSmooth == null ? probe : probeSmooth + (probe - probeSmooth) * 0.18
      else if (probeSmooth != null) probeSmooth = null

      // phosphor persistence: fade the previous frames instead of clearing
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0,0,0,0.32)"
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = "source-over"

      const amp = H * 0.08
      const pts = new Float32Array((samples + 1) * 2)
      for (let i = 0; i <= samples; i++) {
        const t = i / samples
        const n = noise(i, frame, time / 1000) * amp * level * probeFilter(t, probeSmooth)
        pts[i * 2] = t * W
        pts[i * 2 + 1] = yAt(t) + n
      }

      const path = () => {
        ctx.beginPath()
        ctx.moveTo(pts[0], pts[1])
        for (let i = 1; i <= samples; i++) ctx.lineTo(pts[i * 2], pts[i * 2 + 1])
      }
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      // Phosphor colours are the accent token as rgba (canvas can't read
      // CSS variables): bloom pass, then core.
      path()
      ctx.strokeStyle = "rgba(255,176,0,0.14)"
      ctx.lineWidth = desktop ? 12 : 7
      ctx.stroke()
      path()
      ctx.strokeStyle = "rgba(255,196,70,1)"
      ctx.lineWidth = desktop ? 2.4 : 1.8
      ctx.stroke()

      // sweep beam head
      const period = 4200
      const s = (time % period) / period
      const si = Math.round(s * samples)
      const bx = pts[si * 2]
      const by = pts[si * 2 + 1]
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, 18)
      g.addColorStop(0, "rgba(255,236,190,0.9)")
      g.addColorStop(0.3, "rgba(255,176,0,0.4)")
      g.addColorStop(1, "rgba(255,176,0,0)")
      ctx.fillStyle = g
      ctx.fillRect(bx - 18, by - 18, 36, 36)

      // name: letters near the pointer thin and widen; everything stretches
      // a little with scroll velocity
      const stretch = Math.min(velocity * 0.9, 34)
      for (let i = 0; i < letters.length; i++) {
        let lens = 0
        if (pointer && fine && centers[i]) {
          const dx = pointer.x - centers[i].x
          const dy = pointer.y - (centers[i].y - sy)
          const r = fontSize * 0.95
          lens = Math.exp(-(dx * dx + dy * dy) / (r * r))
        }
        const wght = 820 - 560 * lens
        const wdth = Math.min(baseWdth + stretch + 34 * lens, 150)
        const st = letterState[i]
        if (Math.abs(st.wght - wght) > 0.5 || Math.abs(st.wdth - wdth) > 0.2) {
          st.wght += (wght - st.wght) * 0.25
          st.wdth += (wdth - st.wdth) * 0.25
          letters[i].style.fontWeight = st.wght.toFixed(0)
          letters[i].style.fontStretch = `${st.wdth.toFixed(1)}%`
        }
      }

      if (frame % 6 === 0) {
        if (noiseReadRef.current) noiseReadRef.current.textContent = (level * (probeSmooth != null ? 0.4 : 1)).toFixed(2)
        if (stateReadRef.current)
          stateReadRef.current.textContent = level > 0.5 ? "Acquiring" : boost > 0.15 ? "Tracking" : "Holding"
      }
    }

    // phones and tablets draw every other frame (30 fps)
    let tick = 0
    const loop = (time) => {
      raf = requestAnimationFrame(loop)
      if (!desktop && tick++ % 2) return
      draw(time)
    }
    const start = () => {
      if (running || document.hidden) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    // pause off-screen (threshold 0 — see CLAUDE.md on observer margins)
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 })
    io.observe(section)
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      plot.removeEventListener("pointermove", onPlotMove)
      plot.removeEventListener("pointerleave", onPlotLeave)
      section.removeEventListener("pointermove", onPointerMove)
      section.removeEventListener("pointerleave", onPointerLeave)
      letters.forEach((el) => {
        el.style.fontWeight = ""
        el.style.fontStretch = ""
      })
    }
  }, [live])

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden border-b hr-line lg:min-h-[100svh]"
      aria-labelledby="hero-name"
    >
      {/* static depth: fine graticule over a coarse 256px ruling, fading out
          toward the edges; the WebGL field draws over it once live */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className={`absolute inset-0 transition-opacity duration-700 ${fieldOn ? "opacity-0" : ""}`}>
          <div className="graticule absolute inset-0 [mask-image:radial-gradient(ellipse_at_60%_55%,black_25%,transparent_80%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,176,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,176,0,0.08)_1px,transparent_1px)] bg-[size:256px_256px] [mask-image:radial-gradient(ellipse_at_60%_55%,black_15%,transparent_75%)]" />
        </div>
        <div className="absolute -right-[10vw] top-[8%] h-[70vh] w-[55vw] rounded-full bg-accent/[0.09] blur-[140px]" />
        {live && (
          <Suspense fallback={null}>
            <HeroField glowRef={figureRef} masked={wide} onReady={markField} />
          </Suspense>
        )}
        <div className="vignette absolute inset-0" />
      </div>

      <div className="relative mx-auto flex max-w-[1600px] flex-col px-5 pb-8 pt-24 sm:px-8 lg:min-h-[100svh] lg:px-12 lg:pb-10 lg:pt-28">
        <div className="flex items-center justify-between gap-4">
          <p className="readout text-paper/60">
            <span className="text-accent">CH-01</span>
            <span className="hidden sm:inline"> · Signal / Noise</span>
          </p>
          <p className="readout text-paper/60" aria-hidden="true">
            Noise <span ref={noiseReadRef} className="tabular-nums text-accent">{live ? "0.80" : "0.00"}</span> ·{" "}
            <span ref={stateReadRef} className="text-teal">
              {live ? "Acquiring" : "Holding"}
            </span>
          </p>
        </div>

        {/* masthead: the name as one line across the full measure on desktop */}
        <motion.div style={{ y: nameY }} className="mt-8 lg:mt-10">
          <h1
            id="hero-name"
            ref={nameRef}
            className="font-display font-[820] uppercase leading-[0.8] tracking-[-0.035em] text-paper [--hero-wdth:74] [contain:layout] [font-stretch:calc(var(--hero-wdth)*1%)] text-[18.5vw] lg:flex lg:justify-between lg:[--hero-wdth:100] lg:text-[min(7.15vw,114px)]"
          >
            <span className="sr-only">Shantanu Somwanshi</span>
            {NAME.map((word, w) => (
              <span key={word} aria-hidden="true" className="block whitespace-nowrap">
                {[...word].map((ch, i) => (
                  <span key={i} data-letter className={w === 1 ? "text-accent" : undefined}>
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <span aria-hidden="true" className="mt-5 block h-px bg-paper/25 lg:mt-6" />
        </motion.div>

        {/* statement row: who, on the left; the issue's headline figure set
            large on the right, sitting directly over where the curve ends */}
        <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-12 lg:gap-4">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <p className="max-w-xl text-lg leading-relaxed text-paper/85 sm:text-xl">
              Instrumentation engineer, currently pursuing the CFA Program
              (Level I passed). I write a newsletter on personal finance and
              build the software behind it — with the code and data shipped
              alongside every issue.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <HeroLink href={links.newsletter} primary>
                Newsletter
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </HeroLink>
              <HeroLink href={links.github}>
                <GithubMark size={14} />
                GitHub
              </HeroLink>
              <HeroLink href={links.linkedin}>
                <LinkedinMark size={14} />
                LinkedIn
              </HeroLink>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7 lg:text-right">
            <p className="engraved text-paper/65">
              Day 29 · {flat.label} · Nifty 50 · Aug 1991 – Aug 2026
            </p>
            <p
              ref={figureRef}
              className="mt-2 font-display text-[21vw] font-[820] leading-[0.82] tracking-[-0.03em] tabular-nums text-accent glow [font-stretch:82%] sm:text-[8rem] lg:text-[min(12vw,196px)]"
            >
              {formatLakh(flat.corpus)}
            </p>
            <dl className="mt-4 grid gap-0 sm:max-w-md lg:ml-auto">
              {[
                ["Invested", formatLakh(flat.invested)],
                ["Multiple", flat.multiple],
              ].map(([k, v]) => (
                <div key={k} className="ledger-row py-1.5">
                  <dt className="engraved text-paper/65">{k}</dt>
                  <span aria-hidden="true" className="leader" />
                  <dd className="font-mono text-[14px] tabular-nums text-paper">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* the chart: an inset instrument screen on phones, the lower half of
            the page on desktop, running edge to edge */}
        <motion.div
          style={{ y: chartY }}
          className="panel relative mt-10 h-64 sm:h-80 lg:pointer-events-auto lg:absolute lg:inset-x-0 lg:bottom-0 lg:top-[62%] lg:mt-0 lg:h-auto lg:border-0 lg:bg-transparent lg:shadow-none"
        >
          <div aria-hidden="true" className="graticule absolute inset-0 opacity-70 lg:hidden" />
          <p className="sr-only">
            Chart: {flat.label} SIP corpus by year, {YEARS.map((y, i) => `${y} ${formatLakh(flat.values[i])}`).join(", ")}.
          </p>
          <div className="absolute bottom-8 left-0 right-14 top-[8%] lg:bottom-10 lg:right-[8.5rem]">
            {live ? (
              <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                <path
                  d={seriesPath(flat.values, 1000, 1000, Y_MAX)}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2.4"
                  vectorEffect="non-scaling-stroke"
                  style={{ filter: "drop-shadow(0 0 7px rgba(255,176,0,.7))" }}
                />
              </svg>
            )}
            {/* y rules + right-aligned figure column */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {Y_TICKS.map((v) => (
                <div key={v} className="absolute inset-x-0 flex items-center" style={{ top: `${(1 - v / Y_MAX) * 100}%` }}>
                  <span className="h-px flex-1 bg-paper/[0.07]" />
                  <span className="readout absolute left-full top-1/2 w-12 -translate-y-1/2 translate-x-2 text-right text-paper/60 lg:w-24 lg:translate-x-4">
                    {v ? `₹${v / 100}Cr` : "₹0"}
                  </span>
                </div>
              ))}
              {YEARS.map((y, i) => (
                <span
                  key={y}
                  className={`readout absolute top-full mt-2 text-paper/60 ${i % 2 ? "max-lg:hidden" : ""}`}
                  style={{ left: `${(i / (YEARS.length - 1)) * 100}%`, transform: `translateX(${i ? (i === YEARS.length - 1 ? "-100%" : "-50%") : "0"})` }}
                >
                  {y}
                </span>
              ))}
            </div>
            <Crosshair read={readCurve} className="absolute inset-0" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
