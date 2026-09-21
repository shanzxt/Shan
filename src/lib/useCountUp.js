import { useRef, useState } from "react"
import { animate, useReducedMotion } from "framer-motion"
import { EASE_OUT } from "./motion"

// Ties a numeric value to Framer's own `animate()` — the same low-level API
// Hero.jsx already uses for the trace reveal — rather than re-deriving a
// tween loop. Fires once, the first time its element scrolls into view
// (wire `onViewportEnter` up to a `motion.*`'s `onViewportEnter` prop).
export function useCountUp(target, { duration = 1.4, decimals = 0 } = {}) {
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(reduceMotion ? target : 0)
  const firedRef = useRef(false)

  const onViewportEnter = () => {
    if (firedRef.current) return
    firedRef.current = true
    if (reduceMotion) {
      setDisplay(target)
      return
    }
    animate(0, target, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(Number(v.toFixed(decimals))),
    })
  }

  return { display, onViewportEnter }
}
