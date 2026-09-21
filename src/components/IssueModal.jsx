import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, Maximize2, X } from "lucide-react"
import ClipReveal from "./ClipReveal"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import GithubMark from "./icons/GithubMark"

function toChartData(chart) {
  return chart.years.map((year, i) => {
    const row = { year }
    for (const s of chart.series) row[s.key] = s.values[i]
    return row
  })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="border hr-line bg-bg px-3 py-2 font-mono text-xs">
      <div className="mb-1 text-paper/50">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          ₹{p.value}L
        </div>
      ))}
    </div>
  )
}

// Renders **bold** and *italic* markers inside plain text, matching the
// lightweight formatting used in the newsletter data.
function renderInline(text) {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*)/g).filter(Boolean)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-paper">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

function Block({ block, onOpenImage }) {
  switch (block.type) {
    case "h2":
      return (
        <h3 className="mt-10 font-display text-xl font-semibold text-paper first:mt-0 sm:text-2xl">
          {block.text}
        </h3>
      )
    case "quote":
      return (
        <blockquote className="mt-6 border-l-2 border-accent pl-4 font-display text-lg italic leading-snug text-paper/90 sm:text-xl">
          {renderInline(block.text)}
        </blockquote>
      )
    case "list":
      return (
        <ul className="mt-4 flex flex-col gap-3">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-[17px] leading-[1.75] text-paper/80">
              <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
    case "image":
      return (
        <figure className="mt-8">
          <ClipReveal duration={0.7} margin="-40px">
          <button
            type="button"
            onClick={() => onOpenImage(block)}
            className="group relative block w-full cursor-zoom-in border hr-line"
          >
            <img src={block.src} alt={block.alt} loading="lazy" className="w-full transition-opacity group-hover:opacity-80" />
            <span className="absolute inset-0 hidden items-center justify-center bg-bg/40 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100 sm:flex">
              <span className="inline-flex items-center gap-1.5 border hr-line bg-bg px-3 py-1.5 font-mono text-xs text-paper">
                <Maximize2 size={13} />
                View full size
              </span>
            </span>
            <span className="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center bg-bg/70 text-paper/80 sm:hidden">
              <Maximize2 size={14} />
            </span>
          </button>
          </ClipReveal>
          {block.caption && (
            <figcaption className="mt-2 text-xs leading-relaxed text-paper/45">{block.caption}</figcaption>
          )}
        </figure>
      )
    case "p":
    default:
      return (
        <p className="mt-5 text-[17px] leading-[1.75] text-paper/80 first:mt-0">{renderInline(block.text)}</p>
      )
  }
}

function Lightbox({ image, onClose }) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!image) return
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [image, onClose])

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/95 p-4 backdrop-blur-sm sm:p-10"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-label={image.alt}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center border hr-line bg-bg text-paper/60 transition-colors hover:border-accent hover:text-accent sm:right-6 sm:top-6"
          >
            <X size={18} />
          </button>
          <motion.img
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            src={image.src}
            alt={image.alt}
            className="max-h-full max-w-full object-contain"
            onMouseDown={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function IssueModal({ issue, onClose }) {
  const reduceMotion = useReducedMotion()
  const closeRef = useRef(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  // Reset the lightbox whenever the reader closes or switches issues, using
  // the render-time "adjust state on prop change" pattern instead of an
  // effect, since it's derived from `issue` rather than an external system.
  const [trackedIssueId, setTrackedIssueId] = useState(issue?.id)
  if (issue?.id !== trackedIssueId) {
    setTrackedIssueId(issue?.id)
    if (lightboxImage) setLightboxImage(null)
  }

  useEffect(() => {
    if (!issue) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    const onKeyDown = (e) => {
      // Let the lightbox handle its own Escape when it's open.
      if (e.key === "Escape" && !lightboxImage) onClose()
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [issue, onClose, lightboxImage])

  const data = issue ? toChartData(issue.chart) : null

  return (
    <>
    <AnimatePresence>
      {issue && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bg/90 px-4 py-10 backdrop-blur-sm sm:px-6 sm:py-16"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-label={issue.title}
        >
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-2xl border hr-line bg-bg p-6 sm:p-10"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center border hr-line text-paper/60 transition-colors hover:border-accent hover:text-accent sm:right-6 sm:top-6"
            >
              <X size={18} />
            </button>

            {/* Substack-style masthead: byline, title, subtitle, date */}
            <p className="pr-12 font-mono text-xs uppercase tracking-wider text-paper/45">
              Shantanu Somwanshi
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              {issue.title}
            </h2>
            {issue.hook && (
              <p className="mt-3 max-w-xl font-display text-lg italic leading-snug text-paper/55">
                {issue.hook}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b hr-line pb-6 font-mono text-xs text-paper/40">
              <span className="text-teal">Issue {issue.number}</span>
              <span>·</span>
              <span>{issue.date}</span>
            </div>

            <ClipReveal className="mt-8 h-64 w-full" duration={0.7} margin="-40px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--color-line)" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: "rgba(237,234,226,0.5)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    axisLine={{ stroke: "var(--color-line)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(237,234,226,0.5)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-line)" }} />
                  {issue.chart.series.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                      isAnimationActive={!reduceMotion}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ClipReveal>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs">
              {issue.chart.series.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5 text-paper/60">
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                  {s.label} — {s.multiple}
                </div>
              ))}
            </div>

            {/* Full issue body, styled like a Substack post: serif type,
                generous line height, real reading measure. */}
            <div className="mt-10 border-t hr-line pt-8">
              {issue.content?.map((block, i) => (
                <Block key={i} block={block} onOpenImage={setLightboxImage} />
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t hr-line pt-6 font-mono text-sm">
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
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
    <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </>
  )
}
