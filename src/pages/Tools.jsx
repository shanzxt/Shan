import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { tools } from "../data/tools"
import { issues } from "../data/newsletter"
import { EASE_OUT } from "../lib/motion"
import { isInitialLoad } from "../lib/firstLoad"
import TransitionLink from "../components/chrome/TransitionLink"
import SectionHeader from "../components/SectionHeader"
import ToolDisclaimer from "../components/ToolDisclaimer"

// Decorative "pixel world" preview for a tool card: a grid of cells whose
// brightness ripples outward from one corner on hover. Illustration only —
// not data.
function PixelPreview() {
  const n = 12
  return (
    <div aria-hidden="true" className="grid h-full w-full grid-cols-12 gap-[3px] p-4">
      {Array.from({ length: n * n }).map((_, k) => {
        const i = Math.floor(k / n)
        const j = k % n
        const d = i + j
        const base = 0.18 + 0.6 * Math.abs(Math.sin(i * 0.9) * Math.cos(j * 0.7))
        return (
          <span
            key={k}
            className="pixel-cell aspect-square"
            style={{
              "--base": base.toFixed(2),
              animationDelay: `${d * 35}ms`,
              background: i === j ? "var(--color-accent)" : d % 5 === 0 ? "#4e7c7a" : "var(--color-accent)",
            }}
          />
        )
      })}
    </div>
  )
}

export default function Tools() {
  const reduceMotion = useReducedMotion()
  const animateIn = !reduceMotion && !isInitialLoad()

  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-28 pt-24 sm:px-8 lg:px-12 lg:pt-32">
      <TransitionLink
        to="/"
        className="group readout inline-flex items-center gap-1.5 text-paper/60 transition-colors hover:text-accent"
      >
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        back home
      </TransitionLink>

      <SectionHeader channel="CH-07" label="instruments" className="mt-10" />

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="readout text-teal">tools</p>
          <motion.h1
            initial={animateIn ? { y: 40, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="mt-3 font-display text-[15vw] font-[850] uppercase leading-[0.82] tracking-[-0.03em] text-paper sm:text-8xl lg:text-[9.5rem]"
          >
            Try the analysis yourself
          </motion.h1>
        </div>
        <div className="lg:col-span-4 lg:pb-4">
          <p className="max-w-md text-lg leading-relaxed text-paper/75">
            Interactive versions of the newsletter's own analysis, on the same data.
          </p>
          <ToolDisclaimer className="mt-4 max-w-md" />
        </div>
      </div>

      <ul className="mt-16 flex flex-col gap-4">
        {tools.map((tool, i) => {
          const issue = issues.find((x) => x.id === tool.issue)
          return (
            <motion.li
              key={tool.name}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="panel group relative grid grid-cols-1 overflow-hidden lg:grid-cols-12"
            >
              <div className="graticule relative aspect-square border-b border-line lg:col-span-4 lg:aspect-auto lg:border-b-0 lg:border-r">
                <PixelPreview />
                <span className="readout absolute left-4 top-3 bg-bg/80 px-1.5 text-paper/60">
                  T-{String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-col p-6 sm:p-10 lg:col-span-8">
                <span className="readout flex items-center gap-2 text-accent">
                  <span className="led" aria-hidden="true" />
                  live · runs in your browser
                </span>
                <h2 className="mt-5">
                  <TransitionLink
                    to={tool.path}
                    data-cursor="lock"
                    className="font-display text-5xl font-[850] uppercase leading-[0.9] tracking-tight text-paper [font-stretch:80%] transition-[color,font-stretch] duration-500 ease-sweep hover:text-accent hover:[font-stretch:100%] sm:text-7xl"
                  >
                    {tool.title}
                  </TransitionLink>
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/80">{tool.description}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-3 pt-10 font-mono text-[13px]">
                  <TransitionLink
                    to={tool.path}
                    data-cursor="lock"
                    className="group/btn inline-flex h-11 items-center gap-2 bg-accent px-5 font-medium text-ink transition-colors hover:bg-paper"
                  >
                    Open the tool
                    <ArrowRight size={15} className="transition-transform group-hover/btn:translate-x-1" />
                  </TransitionLink>
                  {issue && (
                    <TransitionLink
                      to={`/newsletters/${issue.id}`}
                      className="text-paper/75 underline decoration-paper/25 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                    >
                      Explained in Issue {issue.number}: {issue.title}
                    </TransitionLink>
                  )}
                </div>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
