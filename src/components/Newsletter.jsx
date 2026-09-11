import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { issues } from "../data/newsletter"
import IssueCard from "./IssueCard"
import IssueModal from "./IssueModal"

export default function Newsletter() {
  const reduceMotion = useReducedMotion()
  const [openIssueId, setOpenIssueId] = useState(null)
  const openIssue = issues.find((i) => i.id === openIssueId) ?? null

  return (
    <section id="newsletter" className="border-t hr-line px-6 py-24 sm:px-10 lg:px-16">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="font-mono text-sm text-teal"
      >
        the newsletter
      </motion.p>

      <motion.h2
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="mt-3 max-w-2xl font-display text-3xl font-light leading-tight text-paper sm:text-4xl"
      >
        A lab notebook on money, not a link dump
      </motion.h2>
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="mt-3 max-w-xl text-[15px] leading-relaxed text-paper/70"
      >
        Every issue runs on real numbers pulled from Nifty data via
        jugaad_data, analysed in pandas. The charts below are rendered live
        from that same data — not screenshots.
      </motion.p>

      <div className="mt-12 flex flex-col gap-8">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onOpen={setOpenIssueId} />
        ))}
      </div>

      <IssueModal issue={openIssue} onClose={() => setOpenIssueId(null)} />
    </section>
  )
}
