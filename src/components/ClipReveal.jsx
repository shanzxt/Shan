import { motion, useReducedMotion } from "framer-motion"
import { EASE_OUT } from "../lib/motion"

// Clip-path wipe for distinct visual chunks (charts, screenshots) — reads
// as more considered than a plain opacity fade, and costs nothing extra on
// top of the motion library already in the stack. Falls back to a static,
// unclipped render under reduced motion.
export default function ClipReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  amount = 0,
  ...rest
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      whileInView={{ clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: EASE_OUT, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
