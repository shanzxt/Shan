import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import IntroAnimation from "./IntroAnimation"
import FundPickerTool from "./FundPickerTool"

export default function PortfolioBuilder() {
  return (
    <div className="min-h-screen bg-bg px-6 py-16 sm:px-10">
      <Link
        to="/"
        className="group inline-flex items-center gap-1.5 font-mono text-sm text-paper/60 transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        back home
      </Link>

      <div className="flex min-h-[75vh] flex-col items-center justify-center">
        <IntroAnimation />
      </div>

      <div id="fund-picker" className="flex flex-col items-center pt-8">
        <FundPickerTool />
      </div>
    </div>
  )
}
