// Scroll helpers that cooperate with Lenis when it's running (desktop
// smooth scroll) and fall back to native scrolling otherwise.
export function getLenis() {
  return typeof window !== "undefined" ? window.__lenis : undefined
}

export function scrollToTop() {
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
}

export function scrollToElement(el, { immediate = false } = {}) {
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(el, { offset: -72, immediate })
    return
  }
  el.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" })
}

export function lockScroll(locked) {
  const lenis = getLenis()
  if (lenis) (locked ? lenis.stop() : lenis.start())
  document.documentElement.style.overflow = locked ? "hidden" : ""
}
