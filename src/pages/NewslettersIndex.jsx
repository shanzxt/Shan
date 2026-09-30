import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { issuesByDate } from "../data/newsletter"
import IssueCard from "../components/IssueCard"

export default function NewslettersIndex() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="min-h-screen bg-bg px-6 pb-24 pt-28 sm:px-10 sm:pt-32 lg:px-16">
      <Link
        to="/"
        className="group inline-flex items-center gap-1.5 font-mono text-sm text-paper/60 transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        back home
      </Link>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 font-mono text-sm text-teal"
      >
        the newsletter
      </motion.p>
      <motion.h1
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="mt-3 max-w-2xl font-display text-3xl font-light leading-tight text-paper sm:text-4xl"
      >
        All issues
      </motion.h1>
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="mt-3 max-w-xl text-[15px] leading-relaxed text-paper/70"
      >
        A lab notebook on money, not a link dump. Every issue runs on real
        data and public code.
      </motion.p>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-8">
        {issuesByDate.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  )
}
