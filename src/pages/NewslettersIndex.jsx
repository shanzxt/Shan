import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ArrowUpRight, BookOpen, Sparkles } from "lucide-react"
import { issuesByDate } from "../data/newsletter"
import { EASE_OUT } from "../lib/motion"
import { issueSpark } from "../lib/series"
import { isInitialLoad } from "../lib/firstLoad"
import TransitionLink from "../components/chrome/TransitionLink"
import GithubMark from "../components/icons/GithubMark"
import SectionHeader from "../components/SectionHeader"
import Sparkline from "../components/Sparkline"
import Amount from "../components/Amount"

// The archive as a filings index: one statement row per issue, read left
// to right like a ledger. Number, filing date, the issue itself, its
// headline figure set large and right-aligned, and a trace drawn from the
// issue's own data. The title morphs into the issue page's h1.
const pad = (n) => String(n).padStart(2, "0")

function FilingRow({ issue }) {
  const readHref = `/newsletters/${issue.id}`
  const head = issue.stats[issue.headline ?? 0]
  const spark = issueSpark(issue)

  return (
    <article className="group relative isolate grid grid-cols-12 gap-x-4 gap-y-5 border-b border-line py-10 lg:py-14">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 bg-accent/[0.035] transition-transform duration-500 ease-sweep group-hover:scale-x-100"
      />
      <p className="col-span-3 font-display text-5xl font-[850] leading-[0.8] tabular-nums text-accent [font-stretch:80%] lg:col-span-1 lg:text-6xl">
        {pad(issue.number)}
      </p>
      <div className="col-span-9 lg:col-span-2 lg:pt-1">
        <p className="font-mono text-[13px] tabular-nums text-paper/85">{issue.date}</p>
        {issue.readingTime && <p className="engraved mt-1.5 text-paper/60">{issue.readingTime}</p>}
        {issue.tool && (
          <p className="engraved mt-3 inline-flex items-center gap-1.5 border border-accent/50 px-2 py-1 text-accent">
            <Sparkles size={11} />
            Interactive tool
          </p>
        )}
      </div>

      <div className="col-span-12 lg:col-span-4">
        <h2>
          <TransitionLink
            to={readHref}
            data-cursor="read"
            className="block font-display text-4xl font-[800] uppercase leading-[0.9] tracking-tight text-paper [font-stretch:78%] transition-[color,font-stretch] duration-500 ease-sweep hover:text-accent sm:text-5xl lg:text-[3rem] lg:hover:[font-stretch:86%]"
            style={{ viewTransitionName: `issue-title-${issue.id}` }}
          >
            {issue.title}
          </TransitionLink>
        </h2>
        <p className="mt-4 max-w-xl font-body text-xl italic leading-snug text-paper/75">{issue.hook}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[13px]">
          <TransitionLink
            to={readHref}
            data-cursor="lock"
            className="inline-flex h-11 items-center gap-2 bg-accent px-4 font-medium text-ink transition-colors hover:bg-paper"
          >
            <BookOpen size={15} />
            Read the issue
          </TransitionLink>
          <a
            href={issue.substackUrl}
            target="_blank"
            rel="noreferrer"
            className="group/l inline-flex items-center gap-1.5 text-paper/70 transition-colors hover:text-accent"
          >
            Substack
            <ArrowUpRight size={14} className="transition-transform group-hover/l:translate-x-0.5 group-hover/l:-translate-y-0.5" />
          </a>
          <a
            href={issue.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-paper/70 transition-colors hover:text-accent"
          >
            <GithubMark size={14} />
            Code
          </a>
        </div>
      </div>

      <div className="col-span-6 lg:col-span-3 lg:text-right">
        <p className="font-display text-5xl font-[820] leading-[0.85] tabular-nums text-paper [font-stretch:82%] transition-colors duration-300 group-hover:text-accent lg:text-[3.6rem]">
          <Amount value={head.value} />
        </p>
        <p className="engraved mt-2 text-paper/65">{head.label}</p>
      </div>
      <div className="col-span-6 lg:col-span-2">{spark && <Sparkline spark={spark} />}</div>

      {/* the rest of the issue's statement, as a ledger beneath the title */}
      <dl className="col-span-12 grid gap-x-8 sm:grid-cols-2 lg:col-span-9 lg:col-start-4 lg:grid-cols-4">
        {issue.stats.map((s) => (
          <div key={s.label} className="ledger-row py-2">
            <dt className="engraved text-paper/60">{s.label}</dt>
            <span aria-hidden="true" className="leader" />
            <dd className="font-mono text-[13px] tabular-nums text-paper/90">{s.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

export default function NewslettersIndex() {
  const reduceMotion = useReducedMotion()
  const animateIn = !reduceMotion && !isInitialLoad()

  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-28 pt-24 sm:px-8 lg:px-12 lg:pt-32">
      <TransitionLink
        to="/"
        className="group readout inline-flex items-center gap-1.5 text-paper/60 transition-colors hover:text-accent"
      >
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        back home
      </TransitionLink>

      <SectionHeader channel="CH-04" label="archive" className="mt-10" />

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="readout text-teal">the newsletter</p>
          <motion.h1
            initial={animateIn ? { y: 40, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="mt-3 font-display text-[22vw] font-[850] uppercase leading-[0.8] tracking-[-0.03em] text-paper sm:text-[9rem] lg:text-[12rem]"
          >
            All issues
          </motion.h1>
        </div>
        <div className="lg:col-span-4 lg:pb-4">
          <p className="max-w-md text-lg leading-relaxed text-paper/75">
            A lab notebook on money, not a link dump. Every issue runs on real
            data and public code.
          </p>
          <p className="readout mt-4 text-paper/55">
            <span className="text-accent">{String(issuesByDate.length).padStart(2, "0")}</span> issues on record · newest first
          </p>
        </div>
      </div>

      <section aria-label="Filings" className="mt-20 lg:mt-28">
        <div aria-hidden="true" className="hidden grid-cols-12 gap-x-4 border-b border-paper/25 pb-3 lg:grid">
          <span className="engraved col-span-1 text-paper/60">No.</span>
          <span className="engraved col-span-2 text-paper/60">Filed</span>
          <span className="engraved col-span-4 text-paper/60">Issue</span>
          <span className="engraved col-span-3 text-right text-paper/60">Headline figure</span>
          <span className="engraved col-span-2 text-paper/60">Trace</span>
        </div>
        {issuesByDate.map((issue) => (
          <FilingRow key={issue.id} issue={issue} />
        ))}
      </section>
    </div>
  )
}
