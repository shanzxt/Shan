import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { links as siteLinks } from "../data/links"
import GithubMark from "./icons/GithubMark"
import LinkedinMark from "./icons/LinkedinMark"

const footerLinks = [
  { label: "GitHub", href: siteLinks.github, icon: GithubMark },
  { label: "LinkedIn", href: siteLinks.linkedin, icon: LinkedinMark },
  { label: "Newsletter", href: siteLinks.newsletter },
  { label: "Email", href: siteLinks.email },
]

export default function Footer() {
  const reduceMotion = useReducedMotion()

  return (
    <footer id="contact" className="border-t hr-line px-6 py-16 sm:px-10 lg:px-16">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="font-mono text-sm text-teal"
      >
        get in touch
      </motion.p>

      <motion.h2
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="mt-3 max-w-lg font-display text-3xl font-light leading-tight text-paper sm:text-4xl"
      >
        Writing on personal finance, building the software behind it.
      </motion.h2>

      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
        {footerLinks.map((l) => {
          const Icon = l.icon
          return (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
            >
              {Icon && <Icon size={14} />}
              {l.label}
              {!l.href.startsWith("mailto:") && (
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              )}
            </a>
          )
        })}
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t hr-line pt-6 font-mono text-xs text-paper/40">
        <span>Shantanu Somwanshi</span>
        <span>COEP Technological University — Instrumentation &amp; Control</span>
      </div>
    </footer>
  )
}
