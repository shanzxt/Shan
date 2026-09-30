import { useEffect, useState } from "react"

// Tracks the last heading scrolled past with a plain scroll listener rather
// than IntersectionObserver (see CLAUDE.md: observers with a margin or
// threshold stop re-firing in this environment).
function useActiveHeading(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!ids.length) return
    let frame = 0
    const update = () => {
      frame = 0
      let current = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 140) current = id
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

function TocLinks({ headings, active }) {
  return (
    <ol className="flex flex-col gap-2">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            aria-current={active === h.id ? "location" : undefined}
            className={`block border-l pl-3 leading-snug transition-colors hover:text-accent ${
              active === h.id ? "border-accent text-paper" : "border-paper/15 text-paper/50"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  )
}

// Sticky rail in the left margin on wide screens; a collapsed "In this
// issue" list above the body everywhere else. Hidden for issues with fewer
// than two sections.
export default function IssueToc({ headings }) {
  const [ids] = useState(() => headings.map((h) => h.id))
  const active = useActiveHeading(ids)

  if (headings.length < 2) return null

  return (
    <>
      <nav
        aria-label="In this issue"
        className="print:hidden absolute right-full top-0 mr-12 hidden h-full w-52 xl:block"
      >
        <div className="sticky top-28 font-mono text-xs">
          <p className="mb-3 uppercase tracking-wider text-paper/40">In this issue</p>
          <TocLinks headings={headings} active={active} />
        </div>
      </nav>

      <details className="print:hidden mb-8 border hr-line px-4 py-3 font-mono text-xs xl:hidden">
        <summary className="cursor-pointer uppercase tracking-wider text-paper/50 hover:text-accent">
          In this issue
        </summary>
        <div className="mt-3">
          <TocLinks headings={headings} active={active} />
        </div>
      </details>
    </>
  )
}
