import { motion, useReducedMotion } from "framer-motion"
import { EASE_OUT } from "../lib/motion"

// Channel strip that opens every home section: channel tag, a hairline
// that draws itself across, and the section's own label on the right.
export default function SectionHeader({ channel, label, className = "" }) {
  const reduceMotion = useReducedMotion()
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="readout shrink-0 text-accent">{channel}</span>
      <motion.span
        aria-hidden="true"
        className="h-px flex-1 origin-left bg-line"
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
      />
      {label && <span className="readout shrink-0 text-paper/60">{label}</span>}
    </div>
  )
}
