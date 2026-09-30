import { motion, useReducedMotion } from "framer-motion"
import { EASE_OUT } from "../lib/motion"

const MOTION_TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p, div: motion.div }

// Line-reveal for headings: an overflow-hidden wrapper with the text
// translating up from below. The heading element observes the viewport
// and drives the inner span through variants — the inner span starts
// fully masked, so it can't reliably observe itself.
//
// `show`, when passed, puts the reveal under external control instead of
// the default scroll-into-view trigger.
export default function KineticHeading({
  as: Tag = "h2",
  className = "",
  children,
  delay = 0,
  show,
  viewportAmount = 0,
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <Tag className={className}>
        <span className="block">{children}</span>
      </Tag>
    )
  }

  const MotionTag = MOTION_TAGS[Tag] ?? motion.h2
  const controlled = typeof show === "boolean"
  const trigger = controlled
    ? { animate: show ? "show" : "hidden" }
    : { whileInView: "show", viewport: { once: true, amount: viewportAmount } }

  return (
    <MotionTag className={`overflow-hidden ${className}`} initial="hidden" {...trigger}>
      <motion.span
        className="block"
        variants={{
          hidden: { y: "100%" },
          show: { y: "0%", transition: { duration: 0.7, ease: EASE_OUT, delay } },
        }}
      >
        {children}
      </motion.span>
    </MotionTag>
  )
}
