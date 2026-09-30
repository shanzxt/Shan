import { Suspense, lazy, useEffect, useRef, useState } from "react"
import { isCapableDevice, useFinePointer, useReducedMotionPref } from "../../lib/env"
import { toggleSetting, useSetting } from "../../lib/settings"
import { setSoundEngine, sfx } from "../../lib/sfx"

// Client-only optional layers. Nothing here renders on the server and
// every heavy piece is its own chunk, loaded only when it can run:
//   - Lenis smooth scroll: fine pointer + capable device + motion allowed
//   - probe cursor: fine pointer + motion allowed + not switched off
//   - command palette: first "/" or Cmd/Ctrl+K
//   - sound synth: only once the user switches sound on
const ProbeCursor = lazy(() => import("./ProbeCursor"))
const CommandPalette = lazy(() => import("./CommandPalette"))

const KONAMI = "arrowup,arrowup,arrowdown,arrowdown,arrowleft,arrowright,arrowleft,arrowright,b,a"

function isTyping(target) {
  const tag = target?.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable
}

export default function Effects() {
  const fine = useFinePointer()
  const reduced = useReducedMotionPref()
  const probe = useSetting("probe")
  const sound = useSetting("sound")
  const crt = useSetting("crt")
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const previous = useRef({ sound, crt })

  // Smooth scroll. Lenis keeps native scroll semantics (sticky, anchors,
  // framer's useScroll), so it only changes how wheel input feels.
  useEffect(() => {
    if (!fine || reduced || !isCapableDevice()) return
    let lenis
    let cancelled = false
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.11,
        anchors: { offset: -80 },
        prevent: (node) => node.closest?.("[data-lenis-prevent]") != null,
      })
      window.__lenis = lenis
    })
    return () => {
      cancelled = true
      lenis?.destroy()
      delete window.__lenis
    }
  }, [fine, reduced])

  useEffect(() => {
    document.documentElement.classList.toggle("crt", crt)
  }, [crt])

  useEffect(() => {
    if (!sound) {
      setSoundEngine(null)
      return
    }
    let alive = true
    import("../../lib/sound").then(({ createSound }) => {
      if (!alive) return
      const engine = createSound()
      setSoundEngine(engine)
      if (!previous.current.sound) engine.play("on")
    })
    return () => {
      alive = false
      setSoundEngine(null)
    }
  }, [sound])

  // Status toast when an easter-egg setting flips (not on first render).
  useEffect(() => {
    const prev = previous.current
    let message = null
    if (prev.crt !== crt) message = `CRT mode · ${crt ? "on" : "off"}`
    else if (prev.sound !== sound) message = `Sound · ${sound ? "on" : "off"}`
    previous.current = { sound, crt }
    if (!message) return
    setToast(message)
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [crt, sound])

  useEffect(() => {
    let seq = []
    const onKeyDown = (e) => {
      const typing = isTyping(e.target)
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault()
        sfx("switch")
        setPaletteOpen((open) => !open)
        return
      }
      if (typing) return
      seq = [...seq, e.key.toLowerCase()].slice(-10)
      if (seq.join(",") === KONAMI) {
        seq = []
        toggleSetting("crt")
      }
    }
    const onOpen = () => setPaletteOpen(true)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("palette:open", onOpen)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("palette:open", onOpen)
    }
  }, [])

  return (
    <>
      {fine && !reduced && probe && (
        <Suspense fallback={null}>
          <ProbeCursor />
        </Suspense>
      )}
      {paletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette onClose={() => setPaletteOpen(false)} />
        </Suspense>
      )}
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-5 z-[80] print:hidden">
        {toast && (
          <p className="readout panel flex items-center gap-2 px-3 py-2 text-accent">
            <span className="led" aria-hidden="true" />
            {toast}
          </p>
        )}
      </div>
    </>
  )
}
