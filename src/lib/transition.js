import { flushSync } from "react-dom"
import { chunkForPath } from "./routeChunks"
import { prefersReducedMotion } from "./env"
import { scrollToTop } from "./scroll"
import { sfx } from "./sfx"

export const supportsViewTransitions = () =>
  typeof document !== "undefined" && "startViewTransition" in document

// Navigates inside a View Transition when the browser supports it: the
// route chunk is loaded first (so the new snapshot is the real page, not a
// Suspense fallback), then the router update is flushed synchronously
// inside the transition callback. Anything else is a plain navigation.
export async function transitionTo(navigate, to) {
  const url = new URL(to, window.location.href)
  const samePage = url.pathname === window.location.pathname
  sfx("switch")

  if (!supportsViewTransitions() || prefersReducedMotion() || samePage) {
    navigate(to)
    return
  }

  const chunk = chunkForPath(url.pathname)
  if (chunk) {
    try {
      await chunk()
    } catch {
      navigate(to)
      return
    }
  }

  document.startViewTransition(() => {
    flushSync(() => navigate(to))
    if (!url.hash) scrollToTop()
  })
}
