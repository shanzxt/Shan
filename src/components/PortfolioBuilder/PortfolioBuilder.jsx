import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import ClipReveal from "../ClipReveal"
import UnderTheHood from "../UnderTheHood"
import IntroAnimation from "./IntroAnimation"
import FundPickerTool from "./FundPickerTool"

export default function PortfolioBuilder() {
  return (
    <div className="min-h-screen bg-bg px-6 pb-16 pt-28 sm:px-10 sm:pt-32">
      <Link
        to="/"
        className="group inline-flex items-center gap-1.5 font-mono text-sm text-paper/60 transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        back home
      </Link>

      {/* The intro animation is the site's own strongest motion moment —
          only its container entrance gets the clip-path treatment, its
          internal stages are untouched. */}
      <ClipReveal className="flex min-h-[75vh] flex-col items-center justify-center" amount={0}>
        <IntroAnimation />
      </ClipReveal>

      <ClipReveal id="fund-picker" className="flex flex-col items-center pt-8">
        <FundPickerTool />
      </ClipReveal>

      <div className="mx-auto max-w-5xl px-0 sm:px-4">
        <UnderTheHood />
      </div>
    </div>
  )
}
