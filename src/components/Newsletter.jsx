import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { issuesByDate } from "../data/newsletter"
import IssueCard from "./IssueCard"
import KineticHeading from "./KineticHeading"

export default function Newsletter() {
  const reduceMotion = useReducedMotion()
  const latestIssue = issuesByDate[0]

  return (
    <section id="newsletter" className="border-t hr-line px-6 py-24 sm:px-10 lg:px-16">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.5 }}
        className="font-mono text-sm text-teal"
      >
        the newsletter
      </motion.p>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <KineticHeading
          as="h2"
          delay={0.05}
          className="mt-3 max-w-2xl font-display text-3xl font-light leading-tight text-paper sm:text-4xl"
        >
          A lab notebook on money, not a link dump
        </KineticHeading>
        <Link
          to="/newsletters"
          className="group mb-1 inline-flex items-center gap-1.5 font-mono text-sm text-paper/60 transition-colors hover:text-accent"
        >
          All issues
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="mt-3 max-w-xl text-[15px] leading-relaxed text-paper/70"
      >
        Every issue runs on real numbers — Nifty data via jugaad_data, live
        NAV histories for the fund analyses — analysed in pandas. The charts
        below are rendered live from that same data, not screenshots.
      </motion.p>

      <div className="mt-12">
        <IssueCard issue={latestIssue} />
      </div>
    </section>
  )
}
