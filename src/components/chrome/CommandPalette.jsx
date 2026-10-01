import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { issuesByDate } from "../../data/newsletter"
import { links } from "../../data/links"
import { EASE_OUT } from "../../lib/motion"
import { lockScroll } from "../../lib/scroll"
import { getSetting, toggleSetting } from "../../lib/settings"
import { sfx } from "../../lib/sfx"
import { transitionTo } from "../../lib/transition"

// Terminal-style command palette ("/" or Cmd/Ctrl+K). A combobox over a
// flat command list: type to filter, arrows to move, Enter to run.
function buildCommands(navigate, close, notify) {
  const go = (to) => () => {
    close()
    transitionTo(navigate, to)
  }
  const open = (href) => () => {
    close()
    window.open(href, "_blank", "noopener")
  }
  const toggle = (name, label) => () => {
    toggleSetting(name)
    notify(`${label} · ${getSetting(name) ? "on" : "off"}`)
  }

  return [
    { group: "go", label: "Home", hint: "/", run: go("/") },
    { group: "go", label: "What I do", hint: "/#what-i-do", run: go("/#what-i-do") },
    { group: "go", label: "All newsletter issues", hint: "/newsletters", run: go("/newsletters") },
    ...issuesByDate.map((issue) => ({
      group: "go",
      label: `Issue ${issue.number}: ${issue.title}`,
      hint: `/newsletters/${issue.id}`,
      run: go(`/newsletters/${issue.id}`),
    })),
    { group: "go", label: "Work", hint: "/#work", run: go("/#work") },
    { group: "go", label: "Tools", hint: "/tools", run: go("/tools") },
    { group: "go", label: "Portfolio tool", hint: "/portfolio", run: go("/portfolio") },
    { group: "go", label: "Contact", hint: "/#contact", run: go("/#contact") },
    {
      group: "do",
      label: "Copy email address",
      hint: "clipboard",
      run: async () => {
        try {
          await navigator.clipboard.writeText(links.email.replace("mailto:", ""))
          notify("Email copied")
        } catch {
          notify(links.email.replace("mailto:", ""))
        }
      },
    },
    { group: "do", label: "Open the newsletter on Substack", hint: "external", run: open(links.newsletter) },
    { group: "do", label: "Open GitHub", hint: "external", run: open(links.github) },
    { group: "set", label: "Toggle sound", hint: "sound", run: toggle("sound", "Sound") },
    { group: "set", label: "Toggle probe cursor", hint: "cursor", run: toggle("probe", "Probe cursor") },
    { group: "set", label: "Toggle CRT mode", hint: "↑↑↓↓←→←→BA", run: toggle("crt", "CRT mode") },
  ]
}

export default function CommandPalette({ onClose }) {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const [status, setStatus] = useState("")

  const commands = useMemo(() => buildCommands(navigate, onClose, setStatus), [navigate, onClose])
  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return commands
    return commands.filter((c) => {
      const hay = `${c.label} ${c.hint} ${c.group}`.toLowerCase()
      return terms.every((t) => hay.includes(t))
    })
  }, [commands, query])

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0))

  useEffect(() => {
    const previouslyFocused = document.activeElement
    inputRef.current?.focus()
    lockScroll(true)
    return () => {
      lockScroll(false)
      previouslyFocused?.focus?.()
    }
  }, [])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      sfx("tick")
      setActive((activeIndex + 1) % Math.max(results.length, 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      sfx("tick")
      setActive((activeIndex - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      results[activeIndex]?.run()
    } else if (e.key === "Tab") {
      // single focusable control: keep focus inside the dialog
      e.preventDefault()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-bg/75 px-4 pt-[14vh] backdrop-blur-sm print:hidden"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={reduceMotion ? false : { opacity: 0, y: -12, scaleY: 0.96 }}
        animate={{ opacity: 1, y: 0, scaleY: 1 }}
        transition={{ duration: 0.28, ease: EASE_OUT }}
        className="panel w-full max-w-[640px] origin-top"
      >
        <div className="flex items-center justify-between border-b hr-line px-4 py-2.5">
          <span className="readout flex items-center gap-2 text-paper/60">
            <span className="led" aria-hidden="true" />
            Signal / Noise · command
          </span>
          <span className="readout text-paper/60">esc</span>
        </div>
        <div className="flex items-center gap-3 border-b hr-line px-4">
          <span className="font-mono text-accent" aria-hidden="true">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[activeIndex] ? `palette-${activeIndex}` : undefined}
            aria-label="Type a command or page"
            placeholder="type a command or page…"
            spellCheck={false}
            autoComplete="off"
            className="h-14 w-full bg-transparent font-mono text-[15px] text-paper caret-accent placeholder:text-paper/60 focus:outline-none focus-visible:outline-none"
          />
        </div>
        <ul id="palette-list" ref={listRef} role="listbox" data-lenis-prevent className="max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 && <li className="readout px-4 py-6 text-paper/60">No signal on that frequency.</li>}
          {results.map((c, i) => (
            <li
              key={c.label}
              id={`palette-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === activeIndex}
              onMouseMove={() => i !== activeIndex && setActive(i)}
              onClick={() => c.run()}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === activeIndex ? "bg-accent text-ink" : "text-paper/85"}`}
            >
              <span className={`readout w-7 ${i === activeIndex ? "text-ink/70" : "text-accent/70"}`}>{c.group}</span>
              <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{c.label}</span>
              <span className={`readout hidden sm:inline ${i === activeIndex ? "text-ink/60" : "text-paper/60"}`}>{c.hint}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t hr-line px-4 py-2">
          <span className="readout text-paper/60">↑↓ move · ↵ run</span>
          <span className="readout text-accent" aria-live="polite">
            {status}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
