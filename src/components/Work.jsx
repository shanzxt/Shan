import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { projects } from "../data/projects"
import { EASE_OUT } from "../lib/motion"
import GithubMark from "./icons/GithubMark"

export default function Work() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="work" className="border-t hr-line px-6 py-24 sm:px-10 lg:px-16">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.5 }}
        className="font-mono text-sm text-teal"
      >
        work
      </motion.p>

      <div className="mt-10 flex flex-col">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : i * 0.06, ease: EASE_OUT }}
            className={`group relative grid grid-cols-1 gap-3 border-t hr-line py-8 last:border-b sm:grid-cols-[1fr_2fr] ${p.href ? "" : "cursor-default"}`}
          >
            {p.href && (
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 z-0"
                aria-label={p.title}
              />
            )}

            <div>
              <h3
                className={`font-display text-2xl font-medium text-paper transition-colors ${p.href ? "group-hover:text-accent" : ""}`}
              >
                {p.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-paper/50">{p.role}</p>
            </div>

            <div>
              <p className="max-w-xl text-[15px] leading-relaxed text-paper/70">{p.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="font-mono text-xs text-paper/40">{p.tags.join(" · ")}</span>
                {p.repoHref && (
                  <a
                    href={p.repoHref}
                    target="_blank"
                    rel="noreferrer"
                    className="relative z-10 inline-flex items-center gap-1.5 font-mono text-xs text-paper/60 transition-colors hover:text-accent"
                  >
                    <GithubMark size={12} />
                    code
                  </a>
                )}
              </div>
            </div>

            {p.href && (
              <ArrowUpRight
                size={18}
                className="pointer-events-none absolute right-0 top-8 text-paper/0 transition-colors group-hover:text-accent"
              />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
