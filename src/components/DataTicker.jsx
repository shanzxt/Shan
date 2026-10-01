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
        className="group flex items-baseline gap-3 px-6 py-4"
      >
        <span className="readout text-accent/90">#{String(item.issue.number).padStart(2, "0")}</span>
        <span
          className="h-1.5 w-1.5 -translate-y-px self-center rounded-full"
          style={{ background: item.color ?? "var(--color-teal)" }}
          aria-hidden="true"
        />
        <span className="readout text-paper/65 group-hover:text-paper">{item.label}</span>
        <span aria-hidden="true" className="leader w-10 flex-none" />
        <span className="font-display text-[22px] font-[750] leading-none tabular-nums text-paper [font-stretch:85%] group-hover:text-accent">
          {item.value}
        </span>
      </TransitionLink>
      <span className="h-4 w-px bg-line" aria-hidden="true" />
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
