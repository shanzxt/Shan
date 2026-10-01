import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import { ArrowLeft, ArrowUpRight, BookOpen, Sparkles } from "lucide-react"
import { issuesByDate } from "../data/newsletter"
import { EASE_OUT } from "../lib/motion"
import { isInitialLoad } from "../lib/firstLoad"
import TransitionLink from "../components/chrome/TransitionLink"
import GithubMark from "../components/icons/GithubMark"
import SectionHeader from "../components/SectionHeader"

// The archive as a signal timeline: a trace spine that records itself as
// you scroll, a node per issue, and each issue as a large "screen" —
// cover art in parallax, a giant outlined issue number drifting behind,
// readouts, and a title that morphs into the issue page's h1.
function IssueEntry({ issue, index }) {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const coverY = useTransform(scrollYProgress, [0, 1], [-50, 50])
  const numberY = useTransform(scrollYProgress, [0, 1], [120, -120])
  const readHref = `/newsletters/${issue.id}`
  const flip = index % 2 === 1

  return (
    <motion.article
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT }}
      className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12"
    >
      {/* timeline node */}
      <span
        aria-hidden="true"
        className="absolute -left-[calc(2rem+5px)] top-3 hidden h-[11px] w-[11px] rotate-45 border border-accent bg-bg shadow-phosphor lg:block"
      />

      <motion.span
        aria-hidden="true"
        style={reduceMotion ? undefined : { y: numberY }}
        className={`text-outline pointer-events-none absolute -top-28 select-none font-display text-[9rem] font-[900] leading-none text-accent/20 sm:text-[14rem] lg:-top-52 lg:text-[20rem] ${
          flip ? "left-0 lg:left-[-2%]" : "right-0 lg:right-[-2%]"
        }`}
      >
        {String(issue.number).padStart(2, "0")}
      </motion.span>

      <div className={`relative lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
        <TransitionLink
          to={readHref}
          data-cursor="read"
          aria-label={`Read ${issue.title}`}
          className="group panel relative block aspect-[4/3] overflow-hidden"
        >
          <motion.div style={reduceMotion ? undefined : { y: coverY }} className="absolute -inset-y-16 inset-x-0">
            <picture>
              <source srcSet={issue.coverImage.replace(/\.png$/, ".webp")} type="image/webp" />
              <img
                src={issue.coverImage}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover object-top opacity-80 saturate-[.55] transition duration-700 ease-sweep group-hover:scale-[1.03] group-hover:opacity-100 group-hover:saturate-100"
              />
            </picture>
          </motion.div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.14)_0_1px,transparent_1px_3px)] transition-opacity duration-500 group-hover:opacity-0"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.65)]" />
          <span className="readout absolute left-3 top-3 flex items-center gap-2 bg-bg/80 px-2 py-1 text-paper/70">
            <span className="led" aria-hidden="true" />
            Issue {String(issue.number).padStart(2, "0")}
          </span>
          <span className="readout absolute bottom-3 right-3 flex translate-y-2 items-center gap-1.5 bg-accent px-2.5 py-1.5 text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Read <ArrowUpRight size={12} />
          </span>
        </TransitionLink>
      </div>

      <div className={`relative flex flex-col lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="readout text-accent">{issue.date}</span>
          {issue.readingTime && <span className="readout text-paper/55">· {issue.readingTime}</span>}
          {issue.tool && (
            <span className="readout inline-flex items-center gap-1 border border-accent/50 px-2 py-0.5 text-accent">
              <Sparkles size={11} />
              Interactive tool
            </span>
          )}
        </div>
        <h2 className="mt-4">
          <TransitionLink
            to={readHref}
            data-cursor="read"
            className="block font-display text-4xl font-[800] uppercase leading-[0.92] tracking-tight text-paper [font-stretch:78%] transition-colors hover:text-accent sm:text-5xl lg:text-[3.6rem]"
            style={{ viewTransitionName: `issue-title-${issue.id}` }}
          >
            {issue.title}
          </TransitionLink>
        </h2>
        <p className="mt-4 font-body text-xl italic leading-snug text-paper/75">{issue.hook}</p>

        <dl className="mt-8 grid grid-cols-2 border-t border-line">
          {issue.stats.map((s, i) => (
            <div key={s.label} className={`border-b border-line py-3.5 ${i % 2 === 0 ? "border-r pr-4" : "pl-4"}`}>
              <dt className="readout text-paper/55">{s.label}</dt>
              <dd className="mt-1 font-display text-2xl font-[750] tabular-nums text-paper [font-stretch:85%]">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[13px]">
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
            className="group inline-flex items-center gap-1.5 text-paper/70 transition-colors hover:text-accent"
          >
            Substack
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href={issue.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-paper/70 transition-colors hover:text-accent"
          >
            <GithubMark size={14} />
            Code
          </a>
        </div>
      </div>
    </motion.article>
  )
}

export default function NewslettersIndex() {
  const reduceMotion = useReducedMotion()
  const animateIn = !reduceMotion && !isInitialLoad()
  const timelineRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start 70%", "end 60%"] })
  const spine = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

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

      <div ref={timelineRef} className="relative mt-20 lg:mt-28 lg:pl-8">
        {/* spine: the record trace, drawn by scroll */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 top-0 hidden w-px bg-line lg:block">
          <motion.div
            className="absolute inset-0 origin-top bg-accent shadow-phosphor"
            style={reduceMotion ? undefined : { scaleY: spine }}
          />
        </div>
        <div className="flex flex-col gap-28 lg:gap-40">
          {issuesByDate.map((issue, i) => (
            <IssueEntry key={issue.id} issue={issue} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
