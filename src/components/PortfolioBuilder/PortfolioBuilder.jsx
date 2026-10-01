import { ArrowLeft } from "lucide-react"
import { issues } from "../../data/newsletter"
import ClipReveal from "../ClipReveal"
import TransitionLink from "../chrome/TransitionLink"
import SectionHeader from "../SectionHeader"
import ToolDisclaimer from "../ToolDisclaimer"
import UnderTheHood from "../UnderTheHood"
import IntroAnimation from "./IntroAnimation"
import FundPickerTool from "./FundPickerTool"

// The universe this tool runs on, as the issue itself states it.
const source = issues.find((i) => i.tool === "fund-picker")

const screws = ["left-2.5 top-2.5", "right-2.5 top-2.5", "bottom-2.5 left-2.5", "bottom-2.5 right-2.5"]

function Screws() {
  return screws.map((pos) => (
    <span key={pos} aria-hidden="true" className={`absolute ${pos} h-2 w-2 rounded-full border border-paper/20 bg-paper/10`} />
  ))
}

// CH-07: the portfolio tool as a rack of instruments. The intro animation
// runs on its own "scope" screen, the fund picker sits in a rack unit, and
// the engineering notes follow as a bento. Only the frames are new — the
// animation's stages and the tool's maths are untouched.
export default function PortfolioBuilder() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8 lg:px-12 lg:pt-28">
      <div className="flex items-center justify-between gap-4">
        <TransitionLink
          to="/"
          className="group readout inline-flex items-center gap-1.5 text-paper/60 transition-colors hover:text-accent"
        >
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
          back home
        </TransitionLink>
        <span className="readout flex items-center gap-2 text-paper/60">
          <span className="led" aria-hidden="true" />
          CH-07 · live
        </span>
      </div>

      {/* masthead: the title set large, the issue's own figures beside it
          as a statement */}
      <div className="mt-10 grid gap-8 border-b border-paper/25 pb-10 lg:grid-cols-12 lg:items-end lg:gap-4">
        <h1 className="font-display text-[19vw] font-[850] uppercase leading-[0.8] tracking-[-0.03em] text-paper [font-stretch:78%] lg:col-span-8 lg:text-[min(10vw,10.5rem)]">
          Portfolio tool
        </h1>
        {source && (
          <dl className="lg:col-span-4">
            <dt className="engraved mb-2 text-paper/60">
              #{String(source.number).padStart(2, "0")} · {source.title}
            </dt>
            {source.stats.map((st) => (
              <dd key={st.label} className="ledger-row py-2">
                <span className="engraved text-paper/65">{st.label}</span>
                <span aria-hidden="true" className="leader" />
                <span className="font-display text-3xl font-[800] leading-none tabular-nums text-paper [font-stretch:82%]">
                  {st.value}
                </span>
              </dd>
            ))}
          </dl>
        )}
      </div>

      {/* The intro animation is the site's own strongest motion moment —
          only its container entrance gets the clip-path treatment, its
          internal stages are untouched. */}
      <ClipReveal className="panel graticule relative mt-6 flex min-h-[75vh] flex-col items-center justify-center overflow-hidden px-2 py-10" amount={0}>
        <Screws />
        <span className="readout absolute left-5 top-4 text-paper/60">Scope · the idea</span>
        <IntroAnimation />
      </ClipReveal>

      <div className="mt-20">
        <SectionHeader channel="CH-07.2" label="rack 01 · fund picker" />
      </div>
      <ClipReveal id="fund-picker" className="panel relative mt-6 flex scroll-mt-20 flex-col items-center px-4 pb-10 pt-12 sm:px-8 lg:px-12">
        <Screws />
        <FundPickerTool />
        <ToolDisclaimer className="mt-8 max-w-xl text-center" />
      </ClipReveal>

      <div className="mx-auto max-w-[1600px]">
        <UnderTheHood />
      </div>
    </div>
  )
}
