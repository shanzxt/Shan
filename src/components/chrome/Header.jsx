import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion"

const navItems = [
  { label: "What I do", href: "/#what-i-do" },
  { label: "Newsletter", href: "/#newsletter" },
  { label: "Work", href: "/#work" },
  { label: "Portfolio tool", href: "/portfolio" },
  { label: "Contact", href: "/#contact" },
]

const EXPANDED_HEIGHT = 88
const COMPACT_HEIGHT = 56

export default function Header() {
  const reduceMotion = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const [compact, setCompact] = useState(false)

  useMotionValueEvent(scrollY, "change", (v) => {
    setCompact(v > 80)
  })

  const height = useTransform(scrollY, [0, 120], [EXPANDED_HEIGHT, COMPACT_HEIGHT], { clamp: true })
  const nameScale = useTransform(scrollY, [0, 120], [1, 0.82], { clamp: true })

  return (
    <motion.header
      style={reduceMotion ? { height: compact ? COMPACT_HEIGHT : EXPANDED_HEIGHT } : { height }}
      className={`fixed inset-x-0 top-0 z-40 border-b hr-line backdrop-blur-md transition-colors duration-300 ${
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

        <nav className="flex items-center gap-4 overflow-x-auto whitespace-nowrap font-mono text-xs text-paper/60 sm:gap-6">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className="transition-colors hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* scroll-progress hairline */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
        style={reduceMotion ? { transform: "scaleX(1)" } : { scaleX: scrollYProgress }}
      />
    </motion.header>
  )
}
