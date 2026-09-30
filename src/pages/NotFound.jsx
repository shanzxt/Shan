import { ArrowLeft } from "lucide-react"
import TransitionLink from "../components/chrome/TransitionLink"
import Flatline from "../components/Flatline"

// SMPTE-style colour bars in the site's own palette.
const BARS = [
  "var(--color-paper)",
  "var(--color-accent)",
  "var(--color-teal)",
  "#4e7c7a",
  "var(--color-alarm)",
  "#8a5a5a",
  "var(--color-panel)",
]

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-5 pb-16 pt-24 sm:px-8 lg:px-12 lg:pt-28">
      <div aria-hidden="true" className="grid h-10 grid-cols-7 opacity-80 sm:h-14">
        {BARS.map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="readout flex items-center gap-2 text-alarm">
          <span className="led" style={{ background: "var(--color-alarm)", boxShadow: "0 0 8px var(--color-alarm)" }} aria-hidden="true" />
          No signal
        </span>
        <span className="readout text-paper/55">CH-?? · input lost</span>
      </div>

      <div className="relative my-auto py-16">
        <p className="readout text-teal">404</p>
        <div aria-hidden="true" className="relative mt-4 select-none font-display text-[38vw] font-[900] leading-[0.78] tracking-[-0.05em] lg:text-[22rem]">
          <span className="absolute left-[3px] top-0 text-teal/60 mix-blend-screen">404</span>
          <span className="absolute -left-[3px] top-0 text-alarm/60 mix-blend-screen">404</span>
          <span className="relative text-paper">404</span>
        </div>
        <Flatline className="mt-6 h-16 w-full" />
        <h1 className="mt-8 max-w-3xl font-display text-4xl font-[800] uppercase leading-[0.92] tracking-tight text-paper [font-stretch:80%] sm:text-6xl">
          Nothing on this frequency.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-paper/75">
          The page you asked for doesn't exist, or it moved.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 font-mono text-[13px]">
          <TransitionLink
            to="/"
            data-cursor="lock"
            className="group inline-flex h-11 items-center gap-2 bg-accent px-5 font-medium text-ink transition-colors hover:bg-paper"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            back home
          </TransitionLink>
          <TransitionLink
            to="/newsletters"
            data-cursor="lock"
            className="inline-flex h-11 items-center border border-line px-5 text-paper transition-colors hover:border-accent hover:text-accent"
          >
            all issues
          </TransitionLink>
        </div>
      </div>
    </div>
  )
}
