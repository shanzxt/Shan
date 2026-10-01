import { sfx } from "../lib/sfx"

function TocLinks({ headings, active }) {
  return (
    <ol className="flex flex-col">
      {headings.map((h, i) => {
        const on = active === h.id
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={() => sfx("tick")}
              aria-current={on ? "location" : undefined}
              className={`group flex gap-3 border-l py-2 pl-3 font-mono text-[12px] leading-snug transition-colors ${
                on ? "border-accent text-paper" : "border-line text-paper/55 hover:border-paper/40 hover:text-paper"
              }`}
            >
              <span className={`shrink-0 transition-colors ${on ? "text-accent" : "text-paper/60 group-hover:text-accent"}`}>
                §{String(i + 1).padStart(2, "0")}
              </span>
              <span>{h.text}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}

// Sticky channel list in the left rail on wide screens.
export function TocRail({ headings, active }) {
  if (headings.length < 2) return null
  return (
    <nav aria-label="In this issue" className="sticky top-28 print:hidden">
      <p className="readout mb-4 flex items-center gap-2 text-paper/55">
        <span className="led" aria-hidden="true" />
        In this issue
      </p>
      <TocLinks headings={headings} active={active} />
    </nav>
  )
}

// Collapsible list above the body everywhere else.
export function TocInline({ headings, active }) {
  if (headings.length < 2) return null
  return (
    <details className="panel mb-10 px-4 py-3 print:hidden xl:hidden">
      <summary className="readout cursor-pointer text-paper/65 transition-colors hover:text-accent">
        In this issue · {headings.length} sections
      </summary>
      <div className="mt-3">
        <TocLinks headings={headings} active={active} />
      </div>
    </details>
  )
}
