import { useId, useRef } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"
import { useModal } from "../lib/useModal"

// The site's modal screen. Behaviour follows the 21st.dev / Radix dialog
// (focus trap, Escape, scroll lock, focus return, click outside closes);
// the look is ours: a full-screen graticule, a readout title at top-left,
// a square close key, and a switch-in rather than a floating card.
export default function Dialog({ open, onClose, title, label, children, className = "" }) {
  const ref = useRef(null)
  const titleId = useId()
  const reduce = useReducedMotion()
  useModal(ref, open, onClose)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={`graticule fixed inset-0 z-[60] flex items-center justify-center bg-bg/95 p-4 backdrop-blur-sm print:hidden sm:p-12 ${className}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={label ? undefined : titleId}
          aria-label={label}
        >
          <p id={titleId} className="readout absolute left-4 top-5 text-paper/60 sm:left-6 sm:top-7">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            autoFocus
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center border border-line bg-bg text-paper/70 transition-colors duration-150 hover:border-accent hover:text-accent sm:right-6 sm:top-6"
          >
            <X size={18} />
          </button>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
