import { canUseDOM } from "./env"

// The prerendered HTML is the first paint, so entrance animations on the
// first route would hide content that is already on screen (and push LCP
// back). Components ask this instead: `true` until the first client-side
// navigation, then `false` for every route after that.
// Tracked by router location key during App's render (not in an effect),
// so the destination route of the first navigation already sees `false`.
// The server always reports `true`: the prerenderer renders every route in
// one process and each must come out in its final, visible state.
let firstKey = null
let navigated = false

export const isInitialLoad = () => !canUseDOM || !navigated
export function trackLocation(key) {
  if (!canUseDOM) return
  if (firstKey === null) firstKey = key
  else if (key !== firstKey) navigated = true
}

// Resolves once the CSS boot sequence in index.html has finished (or
// immediately if it isn't running), so the hero can start its own motion
// after the curtain lifts rather than underneath it.
export function whenBootDone() {
  if (!canUseDOM || !document.documentElement.classList.contains("boot")) return Promise.resolve()
  return new Promise((resolve) => {
    const obs = new MutationObserver(() => {
      if (!document.documentElement.classList.contains("boot")) {
        obs.disconnect()
        resolve()
      }
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  })
}
