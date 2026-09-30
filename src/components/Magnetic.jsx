import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { useFinePointer } from "../lib/env"
import { SETTLE } from "../lib/motion"

// Pulls its child toward the pointer while hovered and lets it settle back
// with the site's underdamped spring. Fine pointers only; inert otherwise.
export default function Magnetic({ children, strength = 0.28, className = "" }) {
  const reduceMotion = useReducedMotion()
  const fine = useFinePointer()
  const x = useSpring(useMotionValue(0), SETTLE)
  const y = useSpring(useMotionValue(0), SETTLE)
  const active = fine && !reduceMotion

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={active ? { x, y } : undefined}
      onPointerMove={(e) => {
        if (!active) return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
