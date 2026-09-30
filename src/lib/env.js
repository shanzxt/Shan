import { useSyncExternalStore } from "react"

// Client-only capability checks. Everything here is SSR-safe: on the
// server (prerender) each check returns the conservative answer, so the
// static HTML never contains effect-only markup.
export const canUseDOM = typeof window !== "undefined"

function media(query) {
  return canUseDOM && window.matchMedia(query).matches
}

export const prefersReducedMotion = () => media("(prefers-reduced-motion: reduce)")
export const hasFinePointer = () => media("(hover: hover) and (pointer: fine)")

// "Capable" = worth running the heavier effects (smooth scroll, full-
// density traces). Unknown values count as capable; only clearly low-end
// hardware opts out.
export function isCapableDevice() {
  if (!canUseDOM) return false
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = navigator.deviceMemory ?? 8
  return cores >= 4 && memory >= 4
}

// Subscribes to a media query; `false` during SSR and the first client
// render (keeps the prerendered markup and the client's first paint the
// same), then the real value.
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useReducedMotionPref = () => useMediaQuery("(prefers-reduced-motion: reduce)")
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)")
