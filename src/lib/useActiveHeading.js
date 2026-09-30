import { useEffect, useState } from "react"

// Tracks the last heading scrolled past with a plain scroll listener rather
// than IntersectionObserver (see CLAUDE.md: observers with a margin or
// threshold stop re-firing in this environment).
export function useActiveHeading(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!ids.length) return
    let frame = 0
    const update = () => {
      frame = 0
      let current = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 160) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ids])

  return active
}
