import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { EASE_OUT } from "../lib/motion"
import KineticHeading from "./KineticHeading"
import SectionHeader from "./SectionHeader"

// Every claim here is already published in n2-Diversification/Code's own
// docs (CLAUDE.md, README.md, GOTCHAS.md) — this restates them in a bento
// layout rather than introducing anything new.
const cells = [
  {
    tag: "Pipeline",
    body: "Fund identities and NAV history are resolved offline against mfapi.in and baked into a static JSON file. Nothing is fetched live — the browser only does arithmetic against a trusted, pre-verified blob.",
  },
  {
    tag: "Math engine",
    body: "Correlation, covariance, Jacobi eigen-decomposition, and effective-N all run client-side in plain JS, ported from a Python reference implementation and checked against it — 14/14 tests passing in both languages.",
  },
  {
    tag: "Dataset",
    body: "45 funds across 13 categories, 164 months of month-end NAV history (Jan 2013 – Aug 2026), hand-verified scheme codes rather than guessed ones.",
  },
  {
    tag: "Engineering log",
    body: "25 data-quality and implementation gotchas found and fixed along the way — wrong scheme codes, a 100x face-value consolidation, a Map-vs-object ordering bug — logged in the open.",
    href: "https://github.com/shanzxt/n2-Diversification/blob/main/GOTCHAS.md",
    linkLabel: "read GOTCHAS.md",
  },
]

export default function UnderTheHood() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="mt-24">
      <SectionHeader channel="CH-07.3" label="under the hood" />
      <KineticHeading
        as="h2"
        className="mt-8 max-w-3xl font-display text-4xl font-[800] uppercase leading-[0.92] tracking-tight text-paper [font-stretch:80%] sm:text-6xl"
      >
        How this tool actually gets its numbers
      </KineticHeading>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {cells.map((c, i) => (
          <motion.div
            key={c.tag}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : i * 0.08, ease: EASE_OUT }}
            className={`panel group relative overflow-hidden p-6 transition-colors duration-300 hover:border-accent/40 sm:p-8 ${
              i === 0 || i === 3 ? "lg:col-span-7" : "lg:col-span-5"
            }`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-6 -right-2 font-display text-[7rem] font-[900] leading-none text-paper/[0.05] transition-colors duration-500 group-hover:text-accent/15"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="readout flex items-center gap-2 text-accent">
              <span className="h-px w-5 bg-accent" aria-hidden="true" />
              {c.tag}
            </span>
            <p className="relative mt-4 text-[17px] leading-relaxed text-paper/80">{c.body}</p>
            {c.href && (
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="group/link relative mt-5 inline-flex items-center gap-1.5 font-mono text-[12px] text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
              >
                {c.linkLabel}
                <ArrowUpRight size={12} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
