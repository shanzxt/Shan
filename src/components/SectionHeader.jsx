import { motion, useReducedMotion } from "framer-motion"
import { EASE_OUT } from "../lib/motion"

// Opens every section like a line item on a statement: a full-width rule
// that draws across (the page turning), then "02 · Label", a dotted leader
// and the channel tag set flush right like a figure column.
export default function SectionHeader({ channel, label, className = "" }) {
  const reduceMotion = useReducedMotion()
  const num = channel.replace(/^CH-/, "")
  return (
    <div className={className}>
      <motion.span
        aria-hidden="true"
        className="block h-px origin-left bg-paper/25"
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
      />
      <div className="flex items-baseline gap-3 pt-3">
        <span className="font-mono text-[13px] tabular-nums text-accent">{num}</span>
        <span className="text-paper/40" aria-hidden="true">·</span>
        {label && <span className="font-body text-[17px] italic text-paper/85 first-letter:uppercase">{label}</span>}
        <span aria-hidden="true" className="leader" />
        <span className="readout shrink-0 text-paper/60">{channel}</span>
      </div>
    </div>
  )
}
