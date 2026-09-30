import { Component } from "react"
import { RotateCcw } from "lucide-react"

// Catches render errors (including a lazy chunk that fails to load after a
// redeploy) so a broken section shows a way out instead of a blank page.
// App keys this by pathname, so navigating anywhere resets it.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div role="alert" className="flex min-h-screen flex-col justify-center px-5 pb-24 pt-28 sm:px-8 lg:px-12">
        <p className="readout flex items-center gap-2 text-alarm">
          <span className="led" style={{ background: "var(--color-alarm)", boxShadow: "0 0 8px var(--color-alarm)" }} aria-hidden="true" />
          error
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-[850] uppercase leading-[0.9] tracking-tight text-paper [font-stretch:80%] sm:text-7xl">
          Signal dropped.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-paper/75">
          Something on this page failed to load. A reload usually fixes it.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 font-mono text-[13px]">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="group inline-flex h-11 items-center gap-2 bg-accent px-5 font-medium text-ink transition-colors hover:bg-paper"
          >
            <RotateCcw size={14} className="transition-transform group-hover:-rotate-45" />
            reload
          </button>
          <a href="/" className="inline-flex h-11 items-center border border-line px-5 text-paper transition-colors hover:border-accent hover:text-accent">
            back home
          </a>
        </div>
      </div>
    )
  }
}
