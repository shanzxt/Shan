import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { projects } from "../data/projects"
import { EASE_OUT } from "../lib/motion"
import GithubMark from "./icons/GithubMark"
import SectionHeader from "./SectionHeader"
import SplitHeading from "./SplitHeading"

// CH-05: a patch-bay spec sheet. Each project is a row; hovering a linked
// row sweeps a scanline across it and stretches the title's width axis.
export default function Work() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="work" className="mx-auto max-w-[1600px] scroll-mt-20 px-5 pb-10 pt-20 sm:px-8 lg:px-12 lg:pb-16 lg:pt-28">
      <SectionHeader channel="CH-05" label="outputs" />
      <SplitHeading
        text="work"
        className="mt-8 font-display text-[22vw] font-[850] uppercase leading-[0.8] tracking-[-0.03em] text-paper sm:text-9xl lg:text-[11rem]"
      />

      <div className="mt-12 border-t border-line">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : i * 0.08, ease: EASE_OUT }}
            className="group relative grid grid-cols-1 gap-4 border-b border-line py-8 sm:py-10 lg:grid-cols-12 lg:gap-8"
          >
            {p.href && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-accent/[0.07] transition-transform duration-700 ease-sweep group-hover:scale-x-100"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-sweep group-hover:scale-x-100"
                />
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="lock"
                  className="absolute inset-0 z-0"
                  aria-label={p.title}
                />
              </>
            )}

            <div className="relative flex items-baseline gap-4 lg:col-span-6">
              <span
                className={`readout shrink-0 transition-colors ${p.href ? "text-paper/50 group-hover:text-accent" : "text-paper/50"}`}
              >
                05.{i + 1}
              </span>
              <div className="min-w-0">
                <h3
                  className={`font-display text-4xl font-[800] uppercase leading-[0.9] tracking-tight text-paper [font-stretch:78%] transition-[font-stretch,color] duration-500 ease-sweep sm:text-6xl ${
                    p.href ? "group-hover:text-accent group-hover:[font-stretch:100%]" : ""
                  }`}
                >
                  {p.title}
                </h3>
                <p className="readout mt-3 text-paper/60">{p.role}</p>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <p className="max-w-xl text-[16px] leading-relaxed text-paper/75 sm:text-[17px]">{p.body}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="readout border border-line px-2 py-1 text-[10px] text-paper/65">
                    {t}
                  </span>
                ))}
                {p.repoHref && (
                  <a
                    href={p.repoHref}
                    target="_blank"
                    rel="noreferrer"
                    className="relative z-10 ml-2 inline-flex items-center gap-1.5 font-mono text-[12px] text-paper/70 transition-colors hover:text-accent"
                  >
                    <GithubMark size={12} />
                    code
                  </a>
                )}
              </div>
            </div>

            {p.href && (
              <div className="pointer-events-none relative hidden justify-end lg:col-span-1 lg:flex">
                <span className="flex h-12 w-12 items-center justify-center border border-line text-paper/50 transition-colors duration-500 ease-sweep group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
                  <ArrowUpRight size={18} className="transition-transform duration-500 ease-settle group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
