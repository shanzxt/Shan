import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import KineticHeading from "./KineticHeading"

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
    <section className="mt-20 border-t hr-line pt-16">
      <p className="font-mono text-sm text-teal">under the hood</p>
      <KineticHeading
        as="h2"
        className="mt-3 max-w-xl font-display text-2xl font-light leading-tight text-paper sm:text-3xl"
      >
        How this tool actually gets its numbers
      </KineticHeading>

      <div className="mt-8 grid grid-cols-1 border hr-line sm:grid-cols-2">
        {cells.map((c, i) => (
          <motion.div
            key={c.tag}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : i * 0.06, ease: "easeOut" }}
            className="border-b hr-line p-6 last:border-b-0 sm:border-r sm:p-8 sm:[&:nth-child(2n)]:border-r-0"
          >
            <span className="font-mono text-xs text-paper/40">{c.tag}</span>
            <p className="mt-3 text-[15px] leading-relaxed text-paper/70">{c.body}</p>
            {c.href && (
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="group mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
              >
                {c.linkLabel}
                <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
