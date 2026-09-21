import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { links as siteLinks } from "../data/links"
import GithubMark from "./icons/GithubMark"
import KineticHeading from "./KineticHeading"
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
    // Inverted tonal close: the rest of the site is background-forward
    // dark, this section flips to amber-forward so it reads unmistakably
    // as "the site is over, here's how to reach me" rather than just one
    // more section in the stack.
    <footer id="contact" className="border-t hr-line bg-accent px-6 py-20 text-ink sm:px-10 sm:py-28 lg:px-16">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="font-mono text-sm text-ink/60"
      >
        get in touch
      </motion.p>

      <KineticHeading
        as="h2"
        delay={0.05}
        className="mt-3 max-w-xl font-display text-4xl font-light leading-tight text-ink sm:text-5xl lg:text-6xl"
      >
        Writing on personal finance, building the software behind it.
      </KineticHeading>

      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
        <Link
          to="/portfolio"
          className="group inline-flex items-center gap-1.5 text-ink transition-opacity hover:opacity-70"
        >
          Portfolio builder
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
        {footerLinks.map((l) => {
          const Icon = l.icon
          return (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 text-ink transition-opacity hover:opacity-70"
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

      {/* slow marquee of the site's own real contact email — reduced
          motion gets a single static line instead */}
      <div className="mt-16 overflow-hidden border-t border-ink/15 py-6">
        {reduceMotion ? (
          <p className="font-display text-2xl text-ink/70 sm:text-3xl">{siteLinks.email.replace("mailto:", "")}</p>
        ) : (
          <div className="flex w-max animate-marquee whitespace-nowrap" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="mx-6 font-display text-2xl text-ink/70 sm:text-3xl">
                {siteLinks.email.replace("mailto:", "")}
              </span>
            ))}
          </div>
        )}
        {!reduceMotion && (
          <p className="sr-only">{siteLinks.email.replace("mailto:", "")}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 pt-6 font-mono text-xs text-ink/50">
        <span>Shantanu Somwanshi</span>
        <span>COEP Technological University — Instrumentation &amp; Control</span>
      </div>
    </footer>
  )
}
