import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { SETTLE } from "../lib/motion"

// A readout that settles when its value changes: the new figure drops in
// on the underdamped `settle` spring (one overshoot, then still). The first
// render is static so prerendered numbers are never hidden.
export default function SettleReadout({ value, className = "" }) {
  const reduce = useReducedMotion()
  // arm on the first real change (derived during render, no effect needed)
  const [initial] = useState(value)
  const [armed, setArmed] = useState(false)
  if (!armed && value !== initial) setArmed(true)

  return (
    <span className={`relative inline-flex overflow-hidden tabular-nums ${className}`}>
      <motion.span
        key={value}
        initial={armed && !reduce ? { y: "-0.55em", opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={SETTLE}
      >
        {value}
      </motion.span>
    </span>
  )
}
