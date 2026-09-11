import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { links } from "../data/links"
import { buildTracePath, TRACE_HEIGHT, TRACE_WIDTH } from "../lib/tracePath"
import GithubMark from "./icons/GithubMark"
import LinkedinMark from "./icons/LinkedinMark"

const trace = buildTracePath()

export default function Hero() {
  const reduceMotion = useReducedMotion()
  const pathRef = useRef(null)
  const progress = useMotionValue(0)
  const dotX = useMotionValue(trace.end.x)
  const dotY = useMotionValue(trace.end.y)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    if (reduceMotion) {
      progress.set(1)
      setResolved(true)
      return
    }

    const total = path.getTotalLength()
    let revealed = false

    const controls = animate(0, 1, {
      duration: 2.8,
      delay: 0.3,
      ease: [0.16, 0.9, 0.2, 1],
      onUpdate: (v) => {
        progress.set(v)
        const pt = path.getPointAtLength(v * total)
        dotX.set(pt.x)
        dotY.set(pt.y)
        if (!revealed && v > 0.8) {
          revealed = true
          setResolved(true)
        }
      },
    })

    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion])

  return (
    <section className="relative min-h-screen overflow-hidden bg-bg">
      {/* calibration ticks — static instrumentation texture */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div
          className="absolute inset-x-0 top-0 h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--color-line) 0, var(--color-line) 1px, transparent 1px, transparent 64px)",
          }}
        />
      </div>

      <svg
        viewBox={`0 0 ${TRACE_WIDTH} ${TRACE_HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <motion.path
          ref={pathRef}
          d={trace.d}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ pathLength: progress, opacity: 0.9 }}
        />
        {!reduceMotion && (
          <motion.circle
            r="5"
            fill="var(--color-accent)"
            style={{ cx: dotX, cy: dotY, filter: "drop-shadow(0 0 8px var(--color-accent))" }}
          />
        )}
      </svg>

      <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 pb-24 sm:px-10 lg:px-16">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={resolved ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-3 font-mono text-sm text-teal"
        >
          Day 30 — trace resolved
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={resolved ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="max-w-3xl font-display text-5xl font-light leading-[1.05] tracking-tight text-paper sm:text-6xl lg:text-7xl"
        >
          Shantanu Somwanshi
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={resolved ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.16 }}
          className="mt-5 max-w-xl font-body text-lg text-paper/80 sm:text-xl"
        >
          Instrumentation engineer and CFA Level I candidate. I write a
          newsletter on personal finance and build the software behind it —
          with the code and data shipped alongside every issue.
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={resolved ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.24 }}
          className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-sm"
        >
          <a
            href={links.newsletter}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
          >
            Newsletter
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
          >
            <GithubMark size={14} />
            GitHub
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent"
          >
            <LinkedinMark size={14} />
            LinkedIn
          </a>
        </motion.div>
      </div>
    </section>
  )
}
