import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { links } from "../data/links"
import { EASE_OUT } from "../lib/motion"
import { signalPath, stepResponsePath } from "../lib/signal"
import SectionHeader from "./SectionHeader"
import SplitHeading from "./SplitHeading"

const blocks = [
  {
    tag: "01",
    title: "Instrumentation & Control",
    body: "B.Tech at COEP Technological University, plus an internship at Seiton Technologies building out an industrial control panel — P&IDs, SLDs, PLC/HMI selection, FAT. The same instincts that read a signal off a sensor are the ones I use to read a chart: flat until it isn't, then you look for why.",
    href: links.linkedin,
    linkLabel: "linkedin.com/in/shantanu-somwanshi",
    schematic: "loop",
  },
  {
    tag: "02",
    title: "The finance newsletter",
    body: "A running record of what actually happens with money — SIPs, step-ups, panic-selling, the maths of compounding, and whatever else the data says. Every issue ships with the Python behind it, in the open. I've also passed CFA Level I.",
    href: links.newsletter,
    linkLabel: "shantanusomwanshi.substack.com",
    schematic: "curve",
  },
  {
    tag: "03",
    title: "Building software",
    body: "QueLessly is a live QR-ordering and digital payments platform I built and deployed — real UPI transactions, webhook-verified Razorpay integration, reconciliation-ready schema. Financial data integrity isn't theoretical when real money moves through it.",
    href: links.quelessly,
    linkLabel: "quelessly.com",
    schematic: "grid",
  },
]

// Small self-drawing schematics, one per module — decoration only.
function Draw({ d, delay = 0, className = "stroke-accent", width = 1.5 }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.path
      d={d}
      fill="none"
      strokeWidth={width}
      vectorEffect="non-scaling-stroke"
      className={className}
      initial={reduceMotion ? false : { pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 1.4, ease: EASE_OUT, delay }}
    />
  )
}

// Module 01's second trace: setpoint step vs the process variable settling
// with one overshoot (ζ ≈ 0.5).
function StepResponse() {
  return (
    <div className="relative mt-8 border-t border-line pt-5">
      <div className="flex items-center justify-between">
        <span className="readout text-paper/55">step response</span>
        <span className="readout flex gap-4 text-paper/55">
          <span className="text-teal">— SP</span>
          <span className="text-accent">— PV</span>
          <span>ζ 0.5</span>
        </span>
      </div>
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="mt-3 h-28 w-full" aria-hidden="true">
        {[30, 60, 90].map((y) => (
          <line key={y} x1="0" x2="400" y1={y} y2={y} className="stroke-paper/8" />
        ))}
        <Draw d="M0 110.4 H6 V36 H400" className="stroke-teal" width={1.25} />
        <Draw d={stepResponsePath(400, 120)} delay={0.3} width={2} />
      </svg>
    </div>
  )
}

function Schematic({ kind }) {
  if (kind === "loop") {
    // sensor → controller → valve, closed loop back through the process
    return (
      <svg viewBox="0 0 320 150" className="h-full w-full" aria-hidden="true">
        <Draw d="M20 110 H300" className="stroke-paper/30" />
        <Draw d="M70 110 V70" delay={0.2} />
        <circle cx="70" cy="52" r="18" className="fill-none stroke-accent" strokeWidth="1.5" />
        <Draw d="M88 52 H142" delay={0.4} className="stroke-teal" />
        <rect x="142" y="34" width="56" height="36" className="fill-none stroke-accent" strokeWidth="1.5" />
        <Draw d="M198 52 H252 V96" delay={0.6} className="stroke-teal" />
        <Draw d="M236 96 L268 124 V96 L236 124 Z" delay={0.8} />
        <text x="70" y="56" textAnchor="middle" className="fill-paper/70 font-mono text-[9px]">PT</text>
        <text x="170" y="56" textAnchor="middle" className="fill-accent font-mono text-[9px]">PID</text>
        <text x="252" y="140" textAnchor="middle" className="fill-paper/50 font-mono text-[8px]">FCV</text>
      </svg>
    )
  }
  if (kind === "curve") {
    return (
      <svg viewBox="0 0 320 150" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
        {[30, 60, 90, 120].map((y) => (
          <line key={y} x1="0" x2="320" y1={y} y2={y} className="stroke-paper/8" />
        ))}
        <Draw d={signalPath(320, 150, 12, 138, 60)} width={2} />
        <Draw d="M0 138 C80 128 160 124 320 116" delay={0.3} className="stroke-teal/70" />
      </svg>
    )
  }
  // QR-style finder pattern + payment flow
  const cells = []
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 7; c++) {
      const edge = r === 0 || r === 6 || c === 0 || c === 6
      const core = r >= 2 && r <= 4 && c >= 2 && c <= 4
      if (edge || core) cells.push([r, c])
    }
  return (
    <svg viewBox="0 0 320 150" className="h-full w-full" aria-hidden="true">
      {cells.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={20 + c * 14} y={26 + r * 14} width="12" height="12" className="fill-accent/80" />
      ))}
      <Draw d="M130 75 H300" delay={0.2} className="stroke-teal" />
      {[
        [170, "UPI"],
        [225, "HOOK"],
        [285, "LEDGER"],
      ].map(([x, label], i) => (
        <g key={label}>
          <circle cx={x} cy="75" r="4" className="fill-bg stroke-accent" strokeWidth="1.5" />
          <text x={x} y={i % 2 ? 60 : 100} textAnchor="middle" className="fill-paper/60 font-mono text-[8px]">
            {label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function WhatIDo() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="what-i-do" className="mx-auto max-w-[1600px] scroll-mt-20 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <SectionHeader channel="CH-03" label="inputs" />
      <SplitHeading
        text="what I do"
        className="mt-8 font-display text-[16vw] font-[850] uppercase leading-[0.85] tracking-[-0.03em] text-paper sm:text-8xl lg:text-[9rem]"
      />

      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-2">
        {blocks.map((b, i) => (
          <motion.article
            key={b.tag}
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.7, delay: reduceMotion ? 0 : i * 0.1, ease: EASE_OUT }}
            className={`panel group relative flex flex-col overflow-hidden p-6 transition-colors duration-300 hover:border-accent/40 sm:p-8 ${
              i === 0 ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5"
            }`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-3 -top-8 font-display text-[9rem] font-[900] leading-none text-paper/[0.07] transition-colors duration-500 group-hover:text-accent/25 lg:text-[12rem]"
            >
              {b.tag}
            </span>
            <div className="flex items-center gap-3">
              <span className="readout text-accent">CH-03.{b.tag.slice(1)}</span>
              <span className="h-px w-8 bg-line" aria-hidden="true" />
            </div>
            <div className={`relative my-6 ${i === 0 ? "h-40 lg:h-56" : "h-28"}`}>
              <Schematic kind={b.schematic} />
            </div>
            <h3
              className={`relative font-display font-[800] uppercase leading-[0.95] tracking-tight text-paper [font-stretch:85%] transition-[font-stretch] duration-500 ease-sweep group-hover:[font-stretch:100%] ${
                i === 0 ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl"
              }`}
            >
              {b.title}
            </h3>
            <p className={`relative mt-4 leading-relaxed text-paper/75 ${i === 0 ? "max-w-xl text-[17px] sm:text-lg" : "text-[16px]"}`}>
              {b.body}
            </p>
            {i === 0 && <StepResponse />}
            <a
              href={b.href}
              target="_blank"
              rel="noreferrer"
              className="relative mt-auto inline-flex items-center gap-1.5 self-start pt-6 font-mono text-[12px] text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              {b.linkLabel}
              <ArrowUpRight size={13} />
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
