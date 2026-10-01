import { Suspense, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Maximize2 } from "lucide-react"
import { toolRegistry } from "../data/toolRegistry"
import { headingId } from "../lib/headings"
import { EASE_OUT } from "../lib/motion"
import ClipReveal from "./ClipReveal"
import Dialog from "./Dialog"
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
            className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
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
    <ClipReveal duration={0.9} amount={0} className="relative my-14 print:hidden lg:-mx-24 xl:-mx-40">
      <div className="panel graticule relative border-accent/40 px-4 pb-8 pt-4 sm:px-8">
        {["left-2 top-2", "right-2 top-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-paper/20`} />
        ))}
        <div className="mb-8 flex items-center justify-between border-b border-line pb-3">
          <p className="readout flex items-center gap-2 text-accent">
            <span className="led" aria-hidden="true" />
            Try it yourself
          </p>
          <span className="readout text-paper/60">live · runs in your browser</span>
        </div>
        <Suspense
          fallback={
            <div className="flex min-h-[300px] items-center justify-center">
              <span className="readout text-paper/60">Acquiring…</span>
            </div>
          }
        >
          <div className="flex justify-center">
            <ToolComponent />
          </div>
        </Suspense>
        <ToolDisclaimer className="mt-8 text-center" />
      </div>
    </ClipReveal>
  )
}

const bodyText = "font-body text-[18px] leading-[1.8] text-paper/85 sm:text-[19px]"

function Block({ block, onOpenImage, sectionIndex, figureIndex, isFirstParagraph }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 id={headingId(block.text)} className="mt-16 scroll-mt-28 first:mt-0">
          <span className="readout flex items-center gap-3 text-accent">
            §{String(sectionIndex).padStart(2, "0")}
            <span className="h-px w-10 bg-accent/50" aria-hidden="true" />
          </span>
          <span className="mt-3 block font-display text-3xl font-[800] uppercase leading-[0.95] tracking-tight text-paper [font-stretch:80%] sm:text-[2.6rem]">
            {block.text}
          </span>
        </h2>
      )
    case "quote":
      return (
        <blockquote className="relative my-12 border-l-2 border-accent py-2 pl-6 sm:pl-8 lg:-mr-16">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 -top-10 font-display text-[7rem] font-[900] leading-none text-accent/20"
          >
            “
          </span>
          <p className="relative font-body text-2xl italic leading-snug text-paper sm:text-[1.9rem]">
            {renderInline(block.text)}
          </p>
        </blockquote>
      )
    case "list":
      return (
        <ul className="mt-6 flex flex-col gap-3">
          {block.items.map((item) => (
            <li key={item} className={`flex gap-4 ${bodyText}`}>
              <span className="mt-[0.8em] h-px w-4 shrink-0 bg-accent" aria-hidden="true" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
    case "image":
      return (
        <figure className="my-12 lg:-mx-16">
          <ClipReveal duration={0.9} amount={0}>
            <button
              type="button"
              onClick={() => onOpenImage(block)}
              data-cursor="read"
              className="group panel relative block w-full cursor-zoom-in overflow-hidden p-2 sm:p-3"
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
                  className="w-full transition-transform duration-700 ease-sweep group-hover:scale-[1.01]"
                />
              </picture>
              <span className="readout absolute right-4 top-4 inline-flex items-center gap-1.5 bg-bg/85 px-2 py-1 text-paper/80 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <Maximize2 size={12} />
                <span className="hidden sm:inline">View full size</span>
              </span>
            </button>
          </ClipReveal>
          <figcaption className="mt-3 flex gap-4 text-[14px] leading-relaxed text-paper/65">
            <span className="readout shrink-0 pt-0.5 text-accent">Fig. {String(figureIndex).padStart(2, "0")}</span>
            {block.caption && <span>{block.caption}</span>}
          </figcaption>
        </figure>
      )
    case "tool":
      return <ToolPanel name={block.name} />
    case "p":
    default:
      return (
        <p
          className={`mt-6 first:mt-0 ${bodyText} ${
            isFirstParagraph
              ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[4.6rem] first-letter:font-[900] first-letter:leading-[0.8] first-letter:text-accent"
              : ""
          }`}
        >
          {renderInline(block.text)}
        </p>
      )
  }
}

export function IssueBody({ content, onOpenImage }) {
  let section = 0
  let figure = 0
  let seenParagraph = false
  return (
    <>
      {content?.map((block, i) => {
        if (block.type === "h2") section += 1
        if (block.type === "image") figure += 1
        const isFirstParagraph = block.type === "p" && !seenParagraph
        if (block.type === "p") seenParagraph = true
        return (
          <Block
            key={i}
            block={block}
            onOpenImage={onOpenImage}
            sectionIndex={section}
            figureIndex={figure}
            isFirstParagraph={isFirstParagraph}
          />
        )
      })}
    </>
  )
}

export function Lightbox({ image, onClose }) {
  const reduceMotion = useReducedMotion()

  return (
    <Dialog open={Boolean(image)} onClose={onClose} title="Full size · esc to close" label={image?.alt}>
      {image && (
        <motion.img
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0)" }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          src={image.src}
          alt={image.alt}
          className="max-h-full max-w-full border border-line object-contain"
          onMouseDown={(e) => e.stopPropagation()}
        />
      )}
    </Dialog>
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
