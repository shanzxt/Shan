import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion"
import { Command, Menu, Volume2, VolumeX, X } from "lucide-react"
import { links } from "../../data/links"
import { EASE_OUT } from "../../lib/motion"
import { openCommandPalette } from "../../lib/palette"
import { lockScroll } from "../../lib/scroll"
import { toggleSetting, useSetting } from "../../lib/settings"
import TransitionLink from "./TransitionLink"

const navItems = [
  { label: "What I do", href: "/#what-i-do" },
  { label: "Newsletters", href: "/newsletters", match: "/newsletters" },
  { label: "Work", href: "/#work" },
  { label: "Tools", href: "/tools", match: ["/tools", "/portfolio"] },
  { label: "Contact", href: "/#contact" },
]

function isActive(item, pathname) {
  if (!item.match) return false
  const matches = Array.isArray(item.match) ? item.match : [item.match]
  return matches.some((m) => pathname === m || pathname.startsWith(`${m}/`))
}

// Local time where the site is written — a control-room clock readout.
// Rendered as a placeholder on the server and first client paint.
function useIstClock() {
  const [time, setTime] = useState(null)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])
  return time ?? "--:--"
}

function SoundToggle({ className = "" }) {
  const sound = useSetting("sound")
  return (
    <button
      type="button"
      onClick={() => toggleSetting("sound")}
      aria-pressed={sound}
      aria-label={sound ? "Sound on. Switch off" : "Sound off. Switch on"}
      data-cursor="lock"
      className={`inline-flex h-9 items-center gap-1.5 px-2 text-paper/65 transition-colors hover:text-accent ${className}`}
    >
      {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
      <span className="readout hidden xl:inline">{sound ? "snd on" : "snd off"}</span>
    </button>
  )
}

function MobileMenu({ onClose, pathname }) {
  const reduceMotion = useReducedMotion()
  const firstLinkRef = useRef(null)

  useEffect(() => {
    lockScroll(true)
    firstLinkRef.current?.focus()
    return () => lockScroll(false)
  }, [])

  return (
    <motion.div
      id="mobile-nav"
      initial={reduceMotion ? false : { clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={reduceMotion ? undefined : { clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="graticule fixed inset-0 top-0 z-30 flex flex-col bg-bg px-6 pb-8 pt-24 lg:hidden"
    >
      <p className="readout text-paper/60">Select channel</p>
      <nav aria-label="Main" className="mt-6 flex flex-col">
        {navItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: reduceMotion ? 0 : 0.12 + i * 0.05 }}
            className="border-b hr-line"
          >
            <TransitionLink
              ref={i === 0 ? firstLinkRef : undefined}
              to={item.href}
              onClick={onClose}
              aria-current={isActive(item, pathname) ? "page" : undefined}
              className="group flex items-baseline gap-4 py-4"
            >
              <span className="readout w-8 text-accent/80">{String(i + 1).padStart(2, "0")}</span>
              <span
                className={`font-display text-[2.6rem] font-extrabold uppercase leading-none tracking-tight transition-colors group-hover:text-accent ${
                  isActive(item, pathname) ? "text-accent" : "text-paper"
                }`}
                style={{ fontStretch: "68%" }}
              >
                {item.label}
              </span>
            </TransitionLink>
          </motion.div>
        ))}
      </nav>
      <div className="mt-auto flex items-center justify-between gap-4 pt-8">
        <a href={links.email} className="readout text-paper/70 underline decoration-accent/40 underline-offset-4">
          {links.email.replace("mailto:", "")}
        </a>
        <SoundToggle />
      </div>
    </motion.div>
  )
}

export default function Header() {
  const { scrollY, scrollYProgress } = useScroll()
  const [compact, setCompact] = useState(false)
  const clock = useIstClock()
  const location = useLocation()
  const menuButtonRef = useRef(null)

  // The mobile menu remembers which location it was opened on, so any
  // navigation (including same-page /#id jumps) closes it; Escape does too.
  const [menuKey, setMenuKey] = useState(null)
  const menuOpen = menuKey === location.key
  const closeMenu = () => setMenuKey(null)

  useMotionValueEvent(scrollY, "change", (v) => setCompact(v > 40))

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuKey(null)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [menuOpen])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,height] duration-300 print:hidden ${
          compact || menuOpen ? "h-14 border-line bg-bg/85 backdrop-blur-md" : "h-16 border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <TransitionLink
            to="/"
            data-cursor="lock"
            className="group flex min-w-0 items-center gap-3 text-paper transition-colors hover:text-accent"
          >
            <img src="/logo.png" alt="" width="24" height="24" className="h-6 w-6 shrink-0" />
            <span className="readout truncate text-[12px] text-paper/90 group-hover:text-accent">Shantanu Somwanshi</span>
          </TransitionLink>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item, i) => {
              const active = isActive(item, location.pathname)
              return (
                <TransitionLink
                  key={item.label}
                  to={item.href}
                  data-cursor="lock"
                  aria-current={active ? "page" : undefined}
                  className="group relative flex items-baseline gap-1.5 px-3 py-2"
                >
                  <span className={`readout transition-colors ${active ? "text-accent" : "text-paper/60 group-hover:text-accent"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-mono text-[12px] transition-colors ${active ? "text-accent" : "text-paper/80 group-hover:text-paper"}`}
                  >
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 bottom-1 h-px origin-left bg-accent transition-transform duration-300 ease-sweep ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </TransitionLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-1">
            <span className="readout hidden pr-3 text-paper/55 xl:inline" aria-label={`Local time in India ${clock}`}>
              IST {clock}
            </span>
            <SoundToggle className="hidden lg:inline-flex" />
            <button
              type="button"
              onClick={openCommandPalette}
              data-cursor="lock"
              aria-label="Open command palette"
              className="hidden h-9 items-center gap-1.5 border hr-line px-2.5 text-paper/65 transition-colors hover:border-accent/60 hover:text-accent lg:inline-flex"
            >
              <Command size={13} />
              <span className="readout">K</span>
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuKey(menuOpen ? null : location.key)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="-mr-2 inline-flex h-10 items-center gap-2 px-2 text-paper/80 transition-colors hover:text-accent lg:hidden"
            >
              <span className="readout">{menuOpen ? "Close" : "Menu"}</span>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* scroll-progress hairline */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent shadow-phosphor"
          style={{ scaleX: scrollYProgress }}
        />
      </header>

      <AnimatePresence>
        {menuOpen && <MobileMenu key="menu" onClose={closeMenu} pathname={location.pathname} />}
      </AnimatePresence>
    </>
  )
}
