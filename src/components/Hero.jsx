import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { ArrowUpRight } from "lucide-react"
import { links } from "../data/links"
import { hasFinePointer, isCapableDevice, useReducedMotionPref } from "../lib/env"
import { whenBootDone } from "../lib/firstLoad"
import { compounding, noise, probeFilter, signalPath } from "../lib/signal"
import GithubMark from "./icons/GithubMark"
import LinkedinMark from "./icons/LinkedinMark"
import Magnetic from "./Magnetic"

// CH-01. The site's one live object (DESIGN.md → Hero): a phosphor trace
// of the compounding curve buried in noise. It locks once the boot
// sequence lifts, the probe (cursor or finger) filters the noise around
// it, and scrolling fast shakes it loose again. The name reacts too:
// letters near the probe thin out and widen (Anybody's wght/wdth axes),
// and the whole name stretches with scroll velocity.
//
// First paint (prerender, reduced motion) is a static, fully visible
// render: the clean curve as SVG and the name at rest — nothing is hidden
// waiting for JS, which also keeps the h1 as an early LCP.

const NAME = ["Shantanu", "Somwanshi"]
const TOP = 0.1 // curve peak, fraction of height
const BOTTOM = 0.9 // flat baseline
const TICKS = [5, 10, 15, 20, 25, 30]

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
  const live = isClient && !reduced && armed

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

  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const nameRef = useRef(null)
  const noiseReadRef = useRef(null)
  const stateReadRef = useRef(null)

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

    // state
    let level = 0.7 // global noise amplitude: starts noisy, then locks
    let target = 0.14
    let probe = null // pointer x as fraction of canvas width
    let probeSmooth = null
    let pointer = null // client coords, for the letter lens
    let lastScroll = window.scrollY
    let velocity = 0
    let frame = 0
    let raf = 0
    let running = false
    const letterState = letters.map(() => ({ wght: 820, wdth: baseWdth }))


    const onPointerMove = (e) => {
      const r = canvas.getBoundingClientRect()
      probe = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1)
      pointer = { x: e.clientX, y: e.clientY }
    }
    const onPointerLeave = () => {
      probe = null
      pointer = null
    }
    section.addEventListener("pointermove", onPointerMove, { passive: true })
    section.addEventListener("pointerleave", onPointerLeave)

    const yAt = (t) => BOTTOM * H - compounding(t) * (BOTTOM - TOP) * H

    const draw = (time) => {
      frame++
      // scroll velocity → noise boost + name stretch
      const sy = window.scrollY
      velocity = velocity * 0.86 + Math.abs(sy - lastScroll) * 0.14
      lastScroll = sy
      const boost = Math.min(velocity / 30, 0.9)
      level += (target + boost - level) * 0.045

      if (probe != null) probeSmooth = probeSmooth == null ? probe : probeSmooth + (probe - probeSmooth) * 0.18
      else if (probeSmooth != null) probeSmooth = null

      // phosphor persistence: fade the previous frames instead of clearing
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0,0,0,0.32)"
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = "source-over"

      const amp = H * 0.075
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
      // bloom pass, then core
      path()
      ctx.strokeStyle = "rgba(255,176,0,0.10)"
      ctx.lineWidth = desktop ? 9 : 6
      ctx.stroke()
      path()
      ctx.strokeStyle = "rgba(255,190,60,0.95)"
      ctx.lineWidth = desktop ? 2 : 1.6
      ctx.stroke()

      // sweep beam head
      const period = 3400
      const s = (time % period) / period
      const si = Math.round(s * samples)
      const bx = pts[si * 2]
      const by = pts[si * 2 + 1]
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, 18)
      g.addColorStop(0, "rgba(255,236,190,0.95)")
      g.addColorStop(0.3, "rgba(255,176,0,0.45)")
      g.addColorStop(1, "rgba(255,176,0,0)")
      ctx.fillStyle = g
      ctx.fillRect(bx - 18, by - 18, 36, 36)

      // probe marker on the clean signal
      if (probeSmooth != null) {
        const px = probeSmooth * W
        const py = yAt(probeSmooth)
        ctx.strokeStyle = "rgba(90,209,193,0.9)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(px, py, 5, 0, Math.PI * 2)
        ctx.stroke()
      }

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
          stateReadRef.current.textContent = level > 0.6 ? "Acquiring" : boost > 0.15 ? "Tracking" : "Locked"
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
      className="relative overflow-hidden border-b hr-line lg:min-h-[100svh]"
      aria-labelledby="hero-name"
    >
      {/* graticule, fading out toward the edges */}
      <div
        aria-hidden="true"
        className="graticule pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_40%_45%,black_20%,transparent_75%)]"
      />
      {/* amber bloom behind the bend */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[70vh] w-[60vw] rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col px-5 pb-10 pt-24 sm:px-8 lg:min-h-[100svh] lg:px-12 lg:pb-12 lg:pt-28">
        <div className="flex items-center justify-between gap-4">
          <p className="readout text-paper/60">
            <span className="text-accent">CH-01</span>
            <span className="hidden sm:inline"> · Signal / Noise</span>
          </p>
          <p className="readout text-paper/60" aria-hidden="true">
            Noise <span ref={noiseReadRef} className="tabular-nums text-accent">{live ? "0.70" : "0.00"}</span> ·{" "}
            <span ref={stateReadRef} className="text-teal">
              {live ? "Acquiring" : "Locked"}
            </span>
          </p>
        </div>

        <div className="mt-10 lg:mt-[12vh]">
          <p className="readout text-teal">Day 30 — trace resolved</p>
          <h1
            id="hero-name"
            ref={nameRef}
            className="mt-4 font-display font-[820] uppercase leading-[0.8] tracking-[-0.035em] text-paper [--hero-wdth:74] [contain:layout] [font-stretch:calc(var(--hero-wdth)*1%)] text-[18.5vw] lg:[--hero-wdth:100] lg:text-[min(10.5vw,188px)]"
          >
            <span className="sr-only">Shantanu Somwanshi</span>
            {NAME.map((word, w) => (
              <span key={word} aria-hidden="true" className="block whitespace-nowrap">
                {[...word].map((ch, i) => (
                  <span key={i} data-letter className={w === 1 ? "text-accent glow" : undefined}>
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </h1>
        </div>

        {/* the screen: full-bleed behind everything on desktop, its own
            inset instrument panel on phones */}
        <div
          aria-hidden="true"
          className="panel relative mt-8 h-56 overflow-hidden sm:h-72 lg:pointer-events-none lg:-z-10 lg:absolute lg:inset-0 lg:mt-0 lg:h-auto lg:border-0 lg:bg-transparent lg:shadow-none"
        >
          <div className="graticule absolute inset-0 opacity-70 lg:hidden" />
          {live ? (
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          ) : (
            <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path
                d={signalPath(1000, 1000, TOP * 1000, BOTTOM * 1000)}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                style={{ filter: "drop-shadow(0 0 6px rgba(255,176,0,.6))" }}
              />
            </svg>
          )}
          <div className="absolute inset-x-0 bottom-2 hidden justify-between px-[1.5%] lg:bottom-4 lg:flex">
            {TICKS.map((d) => (
              <span key={d} className="readout text-paper/35">
                D{String(d).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:mt-auto lg:grid-cols-[minmax(0,34rem)_1fr] lg:pb-20">
          <div>
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
        </div>
      </div>
    </section>
  )
}
