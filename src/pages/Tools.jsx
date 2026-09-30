import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { tools } from "../data/tools"
import { issues } from "../data/newsletter"
import ToolDisclaimer from "../components/ToolDisclaimer"

export default function Tools() {
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
        tools
      </motion.p>
      <motion.h1
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="mt-3 max-w-2xl font-display text-3xl font-light leading-tight text-paper sm:text-4xl"
      >
        Try the analysis yourself
      </motion.h1>
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="mt-3 max-w-xl text-[15px] leading-relaxed text-paper/70"
      >
        Interactive versions of the newsletter's own analysis, on the same data.
      </motion.p>
      <ToolDisclaimer className="mt-4 max-w-xl" />

      <ul className="mx-auto mt-12 flex max-w-3xl flex-col gap-6">
        {tools.map((tool) => {
          const issue = issues.find((i) => i.id === tool.issue)
          return (
            <li key={tool.name} className="border hr-line p-5 sm:p-6">
              <h2 className="font-display text-xl font-semibold text-paper sm:text-2xl">
                <Link to={tool.path} className="transition-colors hover:text-accent">
                  {tool.title}
                </Link>
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-paper/70">{tool.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
                <Link
                  to={tool.path}
                  className="group inline-flex items-center gap-1.5 text-accent transition-opacity hover:opacity-80"
                >
                  Open the tool
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                {issue && (
                  <Link
                    to={`/newsletters/${issue.id}`}
                    className="text-paper/70 transition-colors hover:text-accent"
                  >
                    Explained in Issue {issue.number}: {issue.title}
                  </Link>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
