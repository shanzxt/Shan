import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, BookOpen } from "lucide-react"
import { issues } from "../data/newsletter"
import { useMediaQuery, useReducedMotionPref } from "../lib/env"
import { EASE_IN_OUT, bezierEase } from "../lib/motion"
import { getLenis } from "../lib/scroll"
import { issueSpark } from "../lib/series"
import { driveWithGsap } from "../lib/ticker"
import TransitionLink from "./chrome/TransitionLink"
import Amount from "./Amount"
import Sparkline from "./Sparkline"

// The newsletter as a story told in chapters, oldest first. On desktop the
// section pins (CSS sticky) and scrolling turns the page: the current
// chapter lifts away while the next is revealed from below behind an amber
// page edge, scrubbed by GSAP ScrollTrigger on the same frame as Lenis.
// Everywhere else (prerender, phones, reduced motion) the chapters are
// simply stacked statements, all visible, nothing pinned.

const chapters = [...issues].sort((a, b) => a.number - b.number)
const pad = (n) => String(n).padStart(2, "0")
const turnEase = bezierEase(EASE_IN_OUT)

function Chapter({ issue, index, pinned }) {
  const head = issue.stats[issue.headline ?? 0]
  const spark = issueSpark(issue)
  return (
    <article
      data-chapter
      className={`isolate bg-bg ${pinned ? "absolute inset-0 flex flex-col justify-center" : "relative border-t border-paper/25 py-14"}`}
    >
      <span
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -top-6 right-0 -z-10 select-none font-display text-[12rem] font-[900] leading-none text-accent/15 lg:text-[22rem]"
      >
        {pad(issue.number)}
      </span>
      <div data-turn className="grid gap-10 lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-7">
          <p className="engraved text-paper/65">
            Chapter {pad(index + 1)} · Filed {issue.date}
            {issue.readingTime ? ` · ${issue.readingTime}` : ""}
          </p>
          <h3 className="mt-5 max-w-[16ch] font-display text-5xl font-[850] uppercase leading-[0.86] tracking-[-0.02em] text-paper [font-stretch:76%] sm:text-7xl lg:text-[5.6rem]">
            <TransitionLink
              to={`/newsletters/${issue.id}`}
              data-cursor="read"
              className="transition-colors duration-300 hover:text-accent"
            >
              {issue.title}
            </TransitionLink>
          </h3>
          <p className="mt-5 max-w-xl font-body text-xl italic leading-snug text-paper/75 sm:text-2xl">{issue.hook}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[13px]">
            <TransitionLink
              to={`/newsletters/${issue.id}`}
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
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <p className="engraved text-paper/65">{head.label}</p>
          <p className="mt-2 font-display text-7xl font-[820] leading-[0.85] tabular-nums text-accent glow [font-stretch:82%] lg:text-[7.5rem]">
            <Amount value={head.value} />
          </p>
          {spark && <Sparkline spark={spark} tall className="mt-8" />}
          <dl className="mt-6">
            {issue.stats.map((s) => (
              <div key={s.label} className="ledger-row py-2">
                <dt className="engraved text-paper/60">{s.label}</dt>
                <span aria-hidden="true" className="leader" />
                <dd className="font-mono text-[13px] tabular-nums text-paper/90">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  )
}

export default function Chapters() {
  const reduced = useReducedMotionPref()
  const desktop = useMediaQuery("(min-width: 1024px)")
  const canPin = desktop && !reduced && chapters.length > 1
  const [pinned, setPinned] = useState(false)
  const [current, setCurrent] = useState(0)
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const edgeRef = useRef(null)

  useEffect(() => {
    if (!canPin) return
    let cancelled = false
    let tl
    let offLenis
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      driveWithGsap(gsap)
      offLenis = getLenis()?.on("scroll", ScrollTrigger.update)
      setPinned(true)
      // wait a frame so the pinned layout (tall section, stacked pages) exists
      requestAnimationFrame(() => {
        if (cancelled || !stageRef.current) return
        const pages = [...stageRef.current.querySelectorAll("[data-chapter]")]
        const turns = pages.length - 1
        gsap.set(pages.slice(1), { clipPath: "inset(100% 0% 0% 0%)" })
        gsap.set(edgeRef.current, { yPercent: 100, opacity: 0 })
        tl = gsap.timeline({
          defaults: { ease: turnEase },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            // the counter flips at the middle of each page turn
            onUpdate: () => setCurrent(Math.max(0, Math.min(turns, Math.floor((tl.time() - 0.9) / 1.4) + 1))),
          },
        })
        // hold, turn, hold: each chapter rests before the page lifts
        pages.slice(1).forEach((page, k) => {
          const at = 0.4 + k * 1.4
          tl.to(pages[k], { yPercent: -5, opacity: 0.2, duration: 1 }, at)
            .fromTo(page, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, at)
            .fromTo(page.querySelector("[data-turn]"), { y: 70 }, { y: 0, duration: 1 }, at)
            .fromTo(edgeRef.current, { yPercent: 100, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 1 }, at)
            .to(edgeRef.current, { opacity: 0, duration: 0.2 }, at + 1)
        })
        tl.to({}, { duration: 0.4 })
      })
    })
    return () => {
      cancelled = true
      offLenis?.()
      tl?.scrollTrigger?.kill()
      tl?.kill()
      setPinned(false)
    }
  }, [canPin])

  if (!pinned) {
    return (
      <div className="mt-14">
        {chapters.map((issue, i) => (
          <Chapter key={issue.id} issue={issue} index={i} pinned={false} />
        ))}
      </div>
    )
  }

  return (
    <div ref={sectionRef} className="relative mt-14" style={{ height: `${chapters.length * 115}svh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col pb-10 pt-24">
        <div className="flex items-center gap-4 border-t border-paper/25 pt-3">
          <span className="engraved text-paper/65">
            Chapter <span className="text-accent">{pad(current + 1)}</span> / {pad(chapters.length)}
          </span>
          <span aria-hidden="true" className="flex flex-1 gap-1.5">
            {chapters.map((c, i) => (
              <span key={c.id} className={`h-px flex-1 transition-colors duration-300 ${i <= current ? "bg-accent" : "bg-paper/20"}`} />
            ))}
          </span>
        </div>
        <div ref={stageRef} className="relative flex-1 overflow-hidden">
          {chapters.map((issue, i) => (
            <Chapter key={issue.id} issue={issue} index={i} pinned />
          ))}
          {/* the page edge: an amber rule that rides the reveal upward */}
          <div ref={edgeRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 opacity-0">
            <span className="absolute inset-x-0 top-0 h-px bg-accent shadow-phosphor" />
          </div>
        </div>
      </div>
    </div>
  )
}
