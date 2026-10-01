import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react"
import { EASE_OUT } from "../lib/motion"
import TransitionLink from "./chrome/TransitionLink"
import { ChartLegend, SignalChart } from "./IssueChart"
import GithubMark from "./icons/GithubMark"
import Magnetic from "./Magnetic"

// The featured-issue "screen" on the home page: copy and readouts on the
// left, the issue's live chart (or its cover art) on the right. The title
// carries a view-transition-name so it morphs into the issue page's h1.
export default function IssueCard({ issue }) {
  const reduceMotion = useReducedMotion()
  const readHref = `/newsletters/${issue.id}`

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="panel relative grid grid-cols-1 lg:grid-cols-12"
    >
      <div className="flex flex-col p-6 sm:p-8 lg:col-span-5 lg:border-r lg:border-line lg:p-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="readout text-accent">Issue {String(issue.number).padStart(2, "0")}</span>
          <span className="readout text-paper/55">
            {issue.date}
            {issue.readingTime && <> · {issue.readingTime}</>}
          </span>
          {issue.tool && (
            <span className="readout inline-flex items-center gap-1 border border-accent/50 px-2 py-0.5 text-accent">
              <Sparkles size={11} />
              Interactive tool
            </span>
          )}
        </div>

        <TransitionLink
          to={readHref}
          data-cursor="read"
          className="mt-5 block font-display text-3xl font-[750] leading-[1.02] tracking-tight text-paper transition-colors [font-stretch:82%] hover:text-accent sm:text-4xl lg:text-[2.9rem]"
          style={{ viewTransitionName: `issue-title-${issue.id}` }}
        >
          {issue.title}
        </TransitionLink>
        <p className="mt-4 max-w-xl font-body text-lg italic leading-snug text-paper/75">{issue.hook}</p>

        <dl className="mt-8 grid grid-cols-2 border-t border-line">
          {issue.stats.map((s, i) => (
            <div key={s.label} className={`border-b border-line py-4 ${i % 2 === 0 ? "border-r pr-4" : "pl-4"}`}>
              <dt className="readout text-paper/55">{s.label}</dt>
              <dd className="mt-1 font-display text-2xl font-[750] tabular-nums text-paper [font-stretch:85%] sm:text-3xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[13px]">
          <Magnetic>
            <TransitionLink
              to={readHref}
              data-cursor="lock"
              className="inline-flex h-11 items-center gap-2 bg-accent px-4 font-medium text-ink transition-colors hover:bg-paper"
            >
              <BookOpen size={15} />
              Read the issue
            </TransitionLink>
          </Magnetic>
          <a
            href={issue.substackUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-paper/70 transition-colors hover:text-accent"
          >
            Open on Substack
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href={issue.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
          >
            <GithubMark size={14} />
            View the code
          </a>
        </div>
      </div>

      <div className="relative flex flex-col border-t border-line p-4 sm:p-6 lg:col-span-7 lg:border-t-0 lg:p-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="readout flex items-center gap-2 text-paper/55">
            <span className="led" aria-hidden="true" />
            {issue.chart ? "live · rendered from the issue's data" : "from the issue"}
          </span>
          <span className="readout text-paper/60">CH-04</span>
        </div>
        {issue.chart ? (
          <>
            <div className="graticule relative min-h-[260px] flex-1 border border-line p-2 sm:min-h-[360px]">
              <SignalChart chart={issue.chart} />
            </div>
            <ChartLegend chart={issue.chart} className="mt-4" />
          </>
        ) : (
          issue.coverImage && (
            <TransitionLink
              to={readHref}
              data-cursor="read"
              aria-label={`Read ${issue.title}`}
              className="group relative block flex-1 overflow-hidden border border-line"
            >
              <picture>
                <source srcSet={issue.coverImage.replace(/\.png$/, ".webp")} type="image/webp" />
                <img
                  src={issue.coverImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full min-h-[260px] w-full object-cover object-top opacity-85 saturate-[.6] transition duration-700 ease-sweep group-hover:scale-[1.02] group-hover:opacity-100 group-hover:saturate-100"
                />
              </picture>
              {/* CRT scanlines over the "screen"; the chart keeps its own colours */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.12)_0_1px,transparent_1px_3px)] transition-opacity duration-500 group-hover:opacity-0"
              />
            </TransitionLink>
          )
        )}
      </div>
    </motion.article>
  )
}
