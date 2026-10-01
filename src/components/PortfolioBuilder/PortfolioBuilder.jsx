import { ArrowLeft } from "lucide-react"
import ClipReveal from "../ClipReveal"
import TransitionLink from "../chrome/TransitionLink"
import SectionHeader from "../SectionHeader"
import ToolDisclaimer from "../ToolDisclaimer"
import UnderTheHood from "../UnderTheHood"
import IntroAnimation from "./IntroAnimation"
import FundPickerTool from "./FundPickerTool"

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
      {/* The page opens on an animation rather than a heading; this gives
          screen readers and the document outline a top-level title. */}
      <h1 className="sr-only">Portfolio tool</h1>
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
