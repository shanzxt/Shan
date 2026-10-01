import { Suspense, lazy, useMemo, useRef } from "react"
import { useParams } from "react-router-dom"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import { issuesByDate } from "../data/newsletter"
import { IssueBody, Lightbox, useLightbox } from "../components/IssueContent"
import { links } from "../data/links"
import GithubMark from "../components/icons/GithubMark"
import { TocInline, TocRail } from "../components/IssueToc"
import { useActiveHeading } from "../lib/useActiveHeading"
import ReadingRecorder from "../components/ReadingRecorder"
import ShareButton from "../components/ShareButton"
import CompoundingScrub from "../components/CompoundingScrub"
import TransitionLink from "../components/chrome/TransitionLink"
import { issueHeadings } from "../lib/headings"
import { isInitialLoad } from "../lib/firstLoad"
import { EASE_OUT } from "../lib/motion"
import NotFound from "./NotFound"

// Recharts only ships for issues that actually have a masthead chart.
const IssueChart = lazy(() => import("../components/IssueChart"))

function NavPanel({ issue, direction }) {
  const prev = direction === "prev"
  return (
    <TransitionLink
      to={`/newsletters/${issue.id}`}
      data-cursor="lock"
      className={`group relative flex flex-col gap-3 overflow-hidden border border-line p-5 sm:p-6 ${prev ? "" : "text-right sm:col-start-2"}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 scale-x-0 bg-accent transition-transform duration-500 ease-sweep group-hover:scale-x-100 ${prev ? "origin-right" : "origin-left"}`}
      />
      <span className={`readout relative inline-flex items-center gap-1.5 text-paper/60 group-hover:text-ink ${prev ? "" : "justify-end"}`}>
        {prev && <ArrowLeft size={12} />}
        {prev ? "Previous issue" : "Next issue"}
        {!prev && <ArrowRight size={12} />}
      </span>
      <span className="relative font-display text-xl font-[800] uppercase leading-tight text-paper [font-stretch:80%] group-hover:text-ink sm:text-2xl">
        {issue.title}
      </span>
    </TransitionLink>
  )
}

function IssueMasthead({ issue, enter }) {
  const reduceMotion = useReducedMotion()
  const mastRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: mastRef, offset: ["start start", "end start"] })
  const numberY = useTransform(scrollYProgress, [0, 1], [0, 160])

  return (
    <header ref={mastRef} className="relative mt-10 overflow-hidden border-b border-line pb-12 lg:pb-16">
      <motion.span
        aria-hidden="true"
        style={reduceMotion ? undefined : { y: numberY }}
        className="text-outline pointer-events-none absolute -right-4 -top-6 select-none font-display text-[12rem] font-[900] leading-none text-accent/15 sm:text-[18rem] sm:text-accent/25 lg:text-[24rem] print:hidden"
      >
        {String(issue.number).padStart(2, "0")}
      </motion.span>

      {/* filing header: the issue's particulars as a statement row */}
      <motion.dl {...enter(0)} className="relative grid grid-cols-2 border-y border-paper/25 sm:grid-cols-4">
        {[
          ["Filing", `No. ${String(issue.number).padStart(2, "0")}`, "text-accent"],
          ["Filed", issue.date],
          ["Reading", issue.readingTime],
          ["By", "Shantanu Somwanshi"],
        ]
          .filter(([, v]) => v)
          .map(([k, v, tone], i) => (
            <div key={k} className={`py-3 pr-4 ${i ? "sm:border-l sm:border-line sm:pl-4" : ""} ${i % 2 ? "border-l border-line pl-4" : ""}`}>
              <dt className="engraved text-paper/60">{k}</dt>
              <dd className={`mt-1 font-mono text-[13px] tabular-nums ${tone ?? "text-paper/90"}`}>{v}</dd>
            </div>
          ))}
      </motion.dl>
      <h1
        className="relative mt-10 max-w-[16ch] font-display text-[clamp(2.8rem,8.2vw,8.2rem)] font-[850] uppercase leading-[0.86] tracking-[-0.025em] text-paper [font-stretch:76%] lg:mt-14"
        style={{ viewTransitionName: `issue-title-${issue.id}` }}
      >
        {issue.title}
      </h1>
      {issue.hook && (
        <motion.p
          {...enter(0.2)}
          className="relative mt-6 max-w-2xl font-body text-xl italic leading-snug text-paper/80 sm:text-2xl"
        >
          {issue.hook}
        </motion.p>
      )}

      {/* key figures: the issue's own stat callouts, set large and
          right-aligned like the totals line of a statement */}
      <motion.dl {...enter(0.28)} className="relative mt-12 grid grid-cols-2 border-t border-line lg:mt-16 lg:grid-cols-4">
        {issue.stats.map((st, i) => {
          const head = i === (issue.headline ?? 0)
          return (
            <div
              key={st.label}
              className={`border-b border-line py-5 pr-4 text-right ${i % 2 ? "border-l pl-4" : ""} ${i === 2 ? "lg:border-l lg:pl-4" : ""}`}
            >
              <dt className="engraved text-paper/60">{st.label}</dt>
              <dd
                className={`mt-2 font-display text-[2.15rem] font-[820] leading-[0.85] tabular-nums [font-stretch:80%] sm:text-6xl lg:text-6xl xl:text-7xl ${
                  head ? "text-accent glow" : "text-paper"
                }`}
              >
                {st.value}
              </dd>
            </div>
          )
        })}
      </motion.dl>
    </header>
  )
}

export default function NewsletterIssue() {
  const { slug } = useParams()
  const reduceMotion = useReducedMotion()
  const animateIn = !reduceMotion && !isInitialLoad()
  const index = issuesByDate.findIndex((i) => i.id === slug)
  const issue = index === -1 ? null : issuesByDate[index]
  const [lightboxImage, setLightboxImage] = useLightbox(issue?.id)
  const headings = useMemo(() => issueHeadings(issue?.content), [issue])
  const headingIds = useMemo(() => headings.map((h) => h.id), [headings])
  const active = useActiveHeading(headingIds)
  const articleRef = useRef(null)

  if (!issue) return <NotFound />

  // `issuesByDate` is newest-first; "previous" reads chronologically
  // earlier (higher array index), "next" chronologically later.
  const prevIssue = issuesByDate[index + 1] ?? null
  const nextIssue = issuesByDate[index - 1] ?? null

  // Masthead pieces arrive in sequence on client-side navigation (the title
  // itself morphs in via its view-transition-name); the prerendered first
  // load is static.
  const enter = (delay) =>
    animateIn
      ? {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: EASE_OUT, delay },
        }
      : {}

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-24 sm:px-8 lg:pt-28">
        <TransitionLink
          to="/newsletters"
          className="group readout inline-flex items-center gap-1.5 text-paper/60 transition-colors hover:text-accent print:hidden"
        >
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
          all issues
        </TransitionLink>

        <IssueMasthead issue={issue} enter={enter} />

        <div className="mt-12 grid grid-cols-1 gap-10 xl:grid-cols-[210px_minmax(0,680px)_110px] xl:justify-between">
          <aside className="hidden xl:block">
            <TocRail headings={headings} active={active} />
          </aside>

          <motion.article ref={articleRef} {...enter(0.3)} className="min-w-0 max-w-[680px] justify-self-center">
            <TocInline headings={headings} active={active} />

            {issue.chart && (
              <Suspense fallback={<div className="my-10 h-64 sm:h-80" />}>
                <IssueChart issue={issue} />
              </Suspense>
            )}

            <IssueBody content={issue.content} onOpenImage={setLightboxImage} />

            {issue.replay && issue.chart && <CompoundingScrub chart={issue.chart} seriesKey={issue.replay} />}

            <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6 font-mono text-[13px] print:hidden">
              <a
                href={issue.substackUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
              >
                Read on Substack
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
              <ShareButton title={issue.title} />
              <a
                href={links.newsletter}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-11 items-center gap-1.5 bg-accent px-4 text-ink transition-colors hover:bg-paper"
              >
                Subscribe on Substack
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            {(prevIssue || nextIssue) && (
              <nav aria-label="More issues" className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 print:hidden">
                {prevIssue ? <NavPanel issue={prevIssue} direction="prev" /> : <div className="hidden sm:block" />}
                {nextIssue && <NavPanel issue={nextIssue} direction="next" />}
              </nav>
            )}
          </motion.article>

          <aside className="hidden xl:block">
            <ReadingRecorder targetRef={articleRef} headingIds={headingIds} />
          </aside>
        </div>
      </div>
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </>
  )
}
