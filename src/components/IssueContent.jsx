import { Suspense, useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Maximize2, X } from "lucide-react"
import { toolRegistry } from "../data/toolRegistry"
import { headingId } from "../lib/headings"
import ClipReveal from "./ClipReveal"
import ToolDisclaimer from "./ToolDisclaimer"

// Renders **bold**, *italic* and [text](url) markers inside plain text,
// matching the lightweight formatting used in the newsletter data.
function renderInline(text) {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*|\[.+?\]\(.+?\))/g).filter(Boolean)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-paper">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("[")) {
      const match = part.match(/^\[(.+)\]\((.+)\)$/)
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-2 hover:opacity-80"
          >
            {match[1]}
          </a>
        )
      }
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

function ToolPanel({ name }) {
  const ToolComponent = toolRegistry[name]
  if (!ToolComponent) return null

  return (
    <ClipReveal duration={0.7} amount={0} className="mt-8 print:hidden">
      <div className="border-2 border-accent/60 bg-paper/[0.03] px-4 py-8 sm:px-8">
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-wider text-accent">
          Try it yourself
        </p>
        <Suspense fallback={<div className="min-h-[300px]" />}>
          <div className="flex justify-center">
            <ToolComponent />
          </div>
        </Suspense>
        <ToolDisclaimer className="mt-6 text-center" />
      </div>
    </ClipReveal>
  )
}

function Block({ block, onOpenImage }) {
  switch (block.type) {
    case "h2":
      return (
        <h3 id={headingId(block.text)} className="mt-10 scroll-mt-28 font-display text-xl font-semibold text-paper first:mt-0 sm:text-2xl">
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
          <ClipReveal duration={0.7} amount={0}>
            <button
              type="button"
              onClick={() => onOpenImage(block)}
              className="group relative block w-full cursor-zoom-in border hr-line"
            >
              <picture>
                <source srcSet={block.src.replace(/\.png$/, ".webp")} type="image/webp" />
                <img
                  src={block.src}
                  alt={block.alt}
                  loading="lazy"
                  decoding="async"
                  width={block.width ?? 1456}
                  height={block.height ?? 860}
                  className="w-full transition-opacity group-hover:opacity-80"
                />
              </picture>
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
    case "tool":
      return <ToolPanel name={block.name} />
    case "p":
    default:
      return (
        <p className="mt-5 text-[17px] leading-[1.75] text-paper/80 first:mt-0">{renderInline(block.text)}</p>
      )
  }
}

export function IssueBody({ content, onOpenImage }) {
  return (
    <>
      {content?.map((block, i) => (
        <Block key={i} block={block} onOpenImage={onOpenImage} />
      ))}
    </>
  )
}

export function Lightbox({ image, onClose }) {
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
          className="print:hidden fixed inset-0 z-[60] flex items-center justify-center bg-bg/95 p-4 backdrop-blur-sm sm:p-10"
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

export function useLightbox(trackedKey) {
  const [lightboxImage, setLightboxImage] = useState(null)
  const [prevKey, setPrevKey] = useState(trackedKey)
  if (trackedKey !== prevKey) {
    setPrevKey(trackedKey)
    if (lightboxImage) setLightboxImage(null)
  }
  return [lightboxImage, setLightboxImage]
}
