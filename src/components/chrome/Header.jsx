import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion"

const navItems = [
  { label: "What I do", href: "/#what-i-do" },
  { label: "Newsletters", href: "/newsletters" },
  { label: "Work", href: "/#work" },
  { label: "Tools", href: "/tools" },
  { label: "Contact", href: "/#contact" },
]

const EXPANDED_HEIGHT = 88
const COMPACT_HEIGHT = 56

export default function Header() {
  const reduceMotion = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const [compact, setCompact] = useState(false)
  // The mobile menu remembers which location it was opened on, so any
  // navigation (including same-page /#id jumps) closes it; Escape does too.
  const location = useLocation()
  const [menuKey, setMenuKey] = useState(null)
  const menuOpen = menuKey === location.key
  const setMenuOpen = (open) => setMenuKey(open ? location.key : null)

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuKey(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [menuOpen])

  useMotionValueEvent(scrollY, "change", (v) => {
    setCompact(v > 80)
  })

  const height = useTransform(scrollY, [0, 120], [EXPANDED_HEIGHT, COMPACT_HEIGHT], { clamp: true })
  const nameScale = useTransform(scrollY, [0, 120], [1, 0.82], { clamp: true })

  return (
    <motion.header
      style={reduceMotion ? { height: compact ? COMPACT_HEIGHT : EXPANDED_HEIGHT } : { height }}
      className={`fixed inset-x-0 top-0 z-40 print:hidden border-b hr-line backdrop-blur-md transition-colors duration-300 ${
        compact ? "bg-bg/85" : "bg-bg/35"
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link to="/" className="font-mono text-sm text-paper/80 transition-colors hover:text-accent">
          <motion.span
            style={reduceMotion ? undefined : { scale: nameScale }}
            className="inline-block origin-left"
          >
            Shantanu Somwanshi
          </motion.span>
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-6 whitespace-nowrap font-mono text-xs text-paper/60 sm:flex"
        >
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className="transition-colors hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center text-paper/70 transition-colors hover:text-accent sm:hidden"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-full border-b hr-line bg-bg px-6 py-2 font-mono text-sm sm:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="block py-3 text-paper/75 transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {/* scroll-progress hairline */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
        style={reduceMotion ? { transform: "scaleX(1)" } : { scaleX: scrollYProgress }}
      />
    </motion.header>
  )
}
