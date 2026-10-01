import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { EASE_OUT } from "../lib/motion"
import TransitionLink from "./chrome/TransitionLink"
import Chapters from "./Chapters"
import SectionHeader from "./SectionHeader"
import SplitHeading from "./SplitHeading"

export default function Newsletter() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="newsletter" className="mx-auto max-w-[1600px] scroll-mt-20 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <SectionHeader channel="CH-04" label="the newsletter" />

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
        <SplitHeading
          text="A lab notebook on money, not a link dump"
          className="font-display text-5xl font-[800] uppercase leading-[0.9] tracking-[-0.02em] text-paper [font-stretch:80%] sm:text-7xl lg:col-span-8 lg:text-[6.2rem]"
        />
        <div className="lg:col-span-4 lg:pb-3">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.2, ease: EASE_OUT }}
            className="text-[17px] leading-relaxed text-paper/75"
          >
            Every issue runs on real numbers — Nifty data via jugaad_data, live
            NAV histories for the fund analyses — analysed in pandas. The charts
            below are rendered live from that same data, not screenshots.
          </motion.p>
          <TransitionLink
            to="/newsletters"
            data-cursor="lock"
            className="group mt-5 inline-flex items-center gap-2 font-mono text-[13px] text-accent"
          >
            All issues
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </TransitionLink>
        </div>
      </div>

      <Chapters />
    </section>
  )
}
