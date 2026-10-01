import { useEffect, useRef, useState } from "react"
import { sfx } from "../../lib/sfx"

// The signature interaction (DESIGN.md): the cursor is an oscilloscope
// probe — full-viewport crosshair hairlines with X/Y readouts at the
// edges, and a bracket reticle that *locks on* to whatever you point at.
//   lock   links / buttons → brackets snap around the element's box
//   read   [data-cursor="read"] → large reticle, "READ"
//   probe  [data-cursor="probe"] (charts) → hairlines brighten to measure
//   drag   range inputs / [data-cursor="drag"]
//   text   text fields → probe steps aside for the native caret
//   measure [data-cursor="measure"] → hairlines hide; the element draws its
//          own crosshair with the real value under it (Crosshair.jsx)
// One rAF loop writes transforms directly; React only re-renders on mode
// changes. Only mounted for fine pointers without reduced motion (Effects).
const TARGETS = "a, button, summary, label, select, [role='button'], [data-cursor], input[type='range']"
const LABELS = { lock: "Lock", read: "Read", probe: "Probe", drag: "Drag" }

function modeFor(el) {
  if (!el?.closest) return ["idle", null]
  if (el.closest("input:not([type='range']), textarea")) return ["text", null]
  const target = el.closest(TARGETS)
  if (!target) return ["idle", null]
  if (target.dataset.cursor) return [target.dataset.cursor, target]
  if (target.matches("input[type='range']")) return ["drag", target]
  return ["lock", target]
}

export default function ProbeCursor() {
  const rootRef = useRef(null)
  const vLineRef = useRef(null)
  const hLineRef = useRef(null)
  const xReadRef = useRef(null)
  const yReadRef = useRef(null)
  const boxRef = useRef(null)
  const [mode, setMode] = useState("idle")

  useEffect(() => {
    const html = document.documentElement
    html.classList.add("probe-on")

    let px = window.innerWidth / 2
    let py = window.innerHeight / 2
    let visible = false
    let pressed = false
    let target = null
    let currentMode = "idle"
    const cur = { x: px, y: py, w: 22, h: 22 }
    const vel = { x: 0, y: 0, w: 0, h: 0 }
    let lastX = ""
    let lastY = ""
    let raf = 0

    const setVisible = (v) => {
      visible = v
      if (rootRef.current) rootRef.current.style.opacity = v ? "1" : "0"
    }

    const onMove = (e) => {
      px = e.clientX
      py = e.clientY
      if (!visible) setVisible(true)
      const [nextMode, nextTarget] = modeFor(e.target)
      if (nextTarget !== target) {
        target = nextTarget
        if (target && nextMode === "lock") sfx("tick")
      }
      if (nextMode !== currentMode) {
        currentMode = nextMode
        setMode(nextMode)
      }
    }
    const onLeave = (e) => {
      if (!e.relatedTarget) setVisible(false)
    }
    const onDown = () => (pressed = true)
    const onUp = () => (pressed = false)

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return

      if (target && !target.isConnected) target = null

      let goal
      if (target && currentMode === "lock") {
        const r = target.getBoundingClientRect()
        const pad = 6
        goal = { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 }
      } else {
        const size = currentMode === "read" ? 84 : currentMode === "text" ? 0 : currentMode === "drag" ? 34 : 22
        goal = { x: px - size / 2, y: py - size / 2, w: size, h: size }
      }
      if (pressed) {
        goal.x += goal.w * 0.08
        goal.y += goal.h * 0.08
        goal.w *= 0.84
        goal.h *= 0.84
      }

      // Underdamped spring — the site's `settle` response: one overshoot.
      for (const k of ["x", "y", "w", "h"]) {
        vel[k] = vel[k] * 0.68 + (goal[k] - cur[k]) * 0.26
        cur[k] += vel[k]
      }

      if (boxRef.current) {
        boxRef.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`
        boxRef.current.style.width = `${Math.max(cur.w, 0)}px`
        boxRef.current.style.height = `${Math.max(cur.h, 0)}px`
      }
      if (vLineRef.current) vLineRef.current.style.transform = `translate3d(${px}px, 0, 0)`
      if (hLineRef.current) hLineRef.current.style.transform = `translate3d(0, ${py}px, 0)`

      const xText = `X ${(px / window.innerWidth).toFixed(2)}`
      const yText = `Y ${(1 - py / window.innerHeight).toFixed(2)}`
      if (xReadRef.current) {
        xReadRef.current.style.transform = `translate3d(${px + 8}px, 0, 0)`
        if (xText !== lastX) xReadRef.current.textContent = lastX = xText
      }
      if (yReadRef.current) {
        yReadRef.current.style.transform = `translate3d(0, ${py + 6}px, 0)`
        if (yText !== lastY) yReadRef.current.textContent = lastY = yText
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("mouseout", onLeave)
    window.addEventListener("pointerdown", onDown, { passive: true })
    window.addEventListener("pointerup", onUp, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("mouseout", onLeave)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      html.classList.remove("probe-on")
    }
  }, [])

  const hairOpacity = { idle: 0.16, lock: 0.08, read: 0, probe: 0.55, drag: 0.3, text: 0, measure: 0 }[mode]
  const bracket = "absolute h-2.5 w-2.5 border-accent"

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95] opacity-0 transition-opacity duration-200 print:hidden"
    >
      <div
        ref={vLineRef}
        className="absolute left-0 top-0 h-full w-px bg-accent transition-opacity duration-300"
        style={{ opacity: hairOpacity }}
      />
      <div
        ref={hLineRef}
        className="absolute left-0 top-0 h-px w-full bg-accent transition-opacity duration-300"
        style={{ opacity: hairOpacity }}
      />
      <span
        ref={xReadRef}
        className="readout absolute left-0 top-[68px] text-[10px] text-accent/80 transition-opacity duration-300"
        style={{ opacity: hairOpacity ? 1 : 0 }}
      />
      <span
        ref={yReadRef}
        className="readout absolute left-2 top-0 text-[10px] text-accent/80 transition-opacity duration-300"
        style={{ opacity: hairOpacity ? 1 : 0 }}
      />

      <div ref={boxRef} className="absolute left-0 top-0" style={{ width: 22, height: 22 }}>
        <span className={`${bracket} left-0 top-0 border-l border-t`} />
        <span className={`${bracket} right-0 top-0 border-r border-t`} />
        <span className={`${bracket} bottom-0 left-0 border-b border-l`} />
        <span className={`${bracket} bottom-0 right-0 border-b border-r`} />
        {mode === "idle" && <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 bg-accent" />}
        {mode === "read" && (
          <span className="readout absolute inset-0 flex items-center justify-center text-accent glow">Read</span>
        )}
        {LABELS[mode] && mode !== "read" && (
          <span className="readout absolute left-full top-full ml-1 mt-1 whitespace-nowrap bg-bg/80 px-1 text-[10px] text-accent">
            {LABELS[mode]}
          </span>
        )}
      </div>
    </div>
  )
}
