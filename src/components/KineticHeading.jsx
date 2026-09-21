import { motion, useReducedMotion } from "framer-motion"
import { EASE_OUT } from "../lib/motion"

// Line-reveal for section-opening headings: an overflow-hidden wrapper with
// the text translating up from below, rather than a plain fade. Reserved
// for hero-level headings and major section openers — body copy keeps its
// existing fade-up so this stays an accent, not background noise.
//
// `show`, when passed, puts the reveal under external control (e.g. Hero's
// trace-resolved gate) instead of the default scroll-into-view trigger.
export default function KineticHeading({
  as: Tag = "h2",
  className = "",
  children,
  delay = 0,
  show,
  viewportMargin = "-80px",
}) {
  const reduceMotion = useReducedMotion()
  const controlled = typeof show === "boolean"

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: EASE_OUT, delay }

  const motionProps = controlled
    ? {
        initial: reduceMotion ? false : { y: "100%" },
        animate: reduceMotion ? { y: 0 } : { y: show ? "0%" : "100%" },
      }
    : {
        initial: reduceMotion ? false : { y: "100%" },
        whileInView: { y: 0 },
        viewport: { once: true, margin: viewportMargin },
      }

  return (
    <Tag className={`overflow-hidden ${className}`}>
      <motion.span {...motionProps} transition={transition} className="block">
        {children}
      </motion.span>
    </Tag>
  )
}
