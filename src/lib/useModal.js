import { useEffect, useRef } from "react"
import { lockScroll } from "./scroll"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Modal behaviour, the same contract as the Radix / 21st.dev dialog
// primitives: Escape closes, Tab and Shift+Tab cycle inside the panel,
// the page behind can't scroll, and focus returns to whatever opened it.
export function useModal(ref, open, onClose) {
  // latest onClose without re-running the effect (callers pass inline fns)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    const panel = ref.current
    lockScroll(true)

    const first = panel?.querySelector("[autofocus]") ?? panel?.querySelector(FOCUSABLE)
    first?.focus()

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close.current()
        return
      }
      if (e.key !== "Tab" || !panel) return
      const items = [...panel.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const head = items[0]
      const tail = items[items.length - 1]
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault()
        tail.focus()
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault()
        head.focus()
      } else if (!panel.contains(document.activeElement)) {
        e.preventDefault()
        head.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      lockScroll(false)
      opener?.focus?.({ preventScroll: true })
    }
  }, [ref, open])
}
