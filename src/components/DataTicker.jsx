import { useReducedMotion } from "framer-motion"
import { issuesByDate } from "../data/newsletter"
import TransitionLink from "./chrome/TransitionLink"

// Ticker tape of real figures, generated from the newsletter data itself
// (each issue's stat callouts and chart-series multiples) — nothing here
// is typed by hand. Pauses on hover/focus; reduced motion gets a static,
// horizontally scrollable strip instead of the loop.
const items = issuesByDate.flatMap((issue) => [
  ...issue.stats.map((s) => ({ issue, label: s.label, value: s.value })),
  ...(issue.chart?.series ?? []).map((s) => ({ issue, label: s.label, value: s.multiple, color: s.color })),
])

function Item({ item, duplicate = false }) {
  return (
    <li className="flex shrink-0 items-center" aria-hidden={duplicate || undefined}>
      <TransitionLink
        to={`/newsletters/${item.issue.id}`}
        tabIndex={duplicate ? -1 : undefined}
        data-cursor="lock"
        className="group flex items-center gap-3 px-6 py-3.5"
      >
        <span className="readout text-paper/40 group-hover:text-accent">#{String(item.issue.number).padStart(2, "0")}</span>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: item.color ?? "var(--color-teal)" }}
          aria-hidden="true"
        />
        <span className="readout text-paper/70 group-hover:text-paper">{item.label}</span>
        <span className="font-mono text-[13px] font-medium tabular-nums text-accent">{item.value}</span>
      </TransitionLink>
      <span className="h-3 w-px bg-line" aria-hidden="true" />
    </li>
  )
}

export default function DataTicker() {
  const reduceMotion = useReducedMotion()

  return (
    <section aria-label="Figures from the newsletter" className="marquee-pause relative border-b hr-line bg-panel/70">
      <span className="readout absolute left-0 top-0 z-10 hidden h-full items-center gap-2 border-r hr-line bg-bg px-4 text-accent sm:flex">
        <span className="led" aria-hidden="true" />
        Data
      </span>
      {reduceMotion ? (
        <ul className="flex overflow-x-auto sm:pl-24">
          {items.map((item, i) => (
            <Item key={i} item={item} />
          ))}
        </ul>
      ) : (
        <div className="overflow-hidden sm:pl-24">
          <ul className="flex w-max animate-marquee [--marquee-duration:70s]">
            {items.map((item, i) => (
              <Item key={i} item={item} />
            ))}
            {/* second copy makes the loop seamless; hidden from AT and tab order */}
            {items.map((item, i) => (
              <Item key={`dup-${i}`} item={item} duplicate />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
