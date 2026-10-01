import { useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { links as siteLinks } from "../data/links"
import TransitionLink from "./chrome/TransitionLink"
import GithubMark from "./icons/GithubMark"
import LinkedinMark from "./icons/LinkedinMark"
import Lissajous from "./Lissajous"
import SectionHeader from "./SectionHeader"
import SplitHeading from "./SplitHeading"

const footerLinks = [
  { label: "GitHub", href: siteLinks.github, icon: GithubMark },
  { label: "LinkedIn", href: siteLinks.linkedin, icon: LinkedinMark },
  { label: "Newsletter", href: siteLinks.newsletter },
  { label: "Email", href: siteLinks.email },
]

const email = siteLinks.email.replace("mailto:", "")

const rowClass =
  "group relative flex items-center justify-between gap-4 overflow-hidden border-b border-line py-5 font-display text-3xl font-[800] uppercase leading-none tracking-tight text-paper [font-stretch:80%] sm:text-5xl"

function RowSweep() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-sweep group-hover:scale-x-100"
    />
  )
}

// CH-06, signal out. The site's closing screen: an XY-mode oscilloscope
// (Lissajous figure you play with the probe) behind the sign-off, contact
// rows that flood amber on hover, and the real email address running as
// an amber tape band — a single static line under reduced motion.
export default function Footer() {
  const reduceMotion = useReducedMotion()
  const ratioRef = useRef(null)

  return (
    <footer id="contact" data-xy-zone className="relative scroll-mt-16 overflow-hidden border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 pt-20 sm:px-8 lg:px-12 lg:pt-28">
        <SectionHeader channel="CH-06" label="signal out" />

        <div className="relative mt-8 grid gap-10 lg:grid-cols-12">
          <div className="relative z-10 lg:col-span-7">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.5 }}
              className="readout text-teal"
            >
              get in touch
            </motion.p>
            <SplitHeading
              text="Writing on personal finance, building the software behind it."
              className="mt-4 font-display text-5xl font-[800] uppercase leading-[0.9] tracking-[-0.02em] text-paper [font-stretch:78%] sm:text-7xl lg:text-[5.6rem]"
              stagger={0.04}
            />

            <nav aria-label="Contact" className="mt-12 border-t border-line">
              <TransitionLink to="/portfolio" data-cursor="lock" className={rowClass}>
                <RowSweep />
                <span className="relative transition-colors group-hover:text-ink">Portfolio builder</span>
                <ArrowUpRight size={28} className="relative shrink-0 text-accent transition-all group-hover:rotate-45 group-hover:text-ink" />
              </TransitionLink>
              {footerLinks.map((l) => {
                const Icon = l.icon
                const external = !l.href.startsWith("mailto:")
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target={external ? "_blank" : undefined}
                    rel="noreferrer"
                    data-cursor="lock"
                    className={rowClass}
                  >
                    <RowSweep />
                    <span className="relative flex items-center gap-4 transition-colors group-hover:text-ink">
                      {Icon && <Icon size={22} />}
                      {l.label}
                    </span>
                    {external && (
                      <ArrowUpRight size={28} className="relative shrink-0 text-accent transition-all group-hover:rotate-45 group-hover:text-ink" />
                    )}
                  </a>
                )
              })}
            </nav>
          </div>

          <div className="relative lg:col-span-5">
            <div className="panel graticule relative aspect-square w-full overflow-hidden lg:sticky lg:top-24">
              <Lissajous className="absolute inset-4" ratioRef={ratioRef} />
              <div className="readout absolute left-3 top-3 text-paper/55">XY mode</div>
              <div className="readout absolute right-3 top-3 text-accent" aria-hidden="true">
                f<sub>x</sub>:f<sub>y</sub> <span ref={ratioRef}>3:2</span>
              </div>
              <div className="readout absolute bottom-3 left-3 text-paper/45" aria-hidden="true">
                move the probe to retune
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* the real contact email as an amber tape band */}
      <div className="on-accent mt-20 overflow-hidden bg-accent py-5 text-ink">
        {reduceMotion ? (
          <p className="px-5 font-display text-3xl font-[800] uppercase [font-stretch:80%] sm:text-5xl">{email}</p>
        ) : (
          <>
            <div className="flex w-max animate-marquee [--marquee-duration:26s]" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="mx-8 flex items-center gap-8 font-display text-3xl font-[800] uppercase [font-stretch:80%] sm:text-5xl">
                  {email}
                  <span className="h-3 w-3 rotate-45 bg-ink" />
                </span>
              ))}
            </div>
            <p className="sr-only">{email}</p>
          </>
        )}
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8 lg:px-12">
        <span className="readout text-paper/60">Shantanu Somwanshi</span>
        <span className="readout text-paper/60">COEP Technological University — Instrumentation &amp; Control</span>
        <span className="readout flex items-center gap-2 text-paper/45">
          <span className="led" aria-hidden="true" />
          end of transmission
        </span>
      </div>
    </footer>
  )
}
