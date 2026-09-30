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
      <div
        role="alert"
        className="flex min-h-screen flex-col justify-center bg-bg px-6 pb-24 pt-28 sm:px-10 lg:px-16"
      >
        <p className="font-mono text-sm text-teal">error</p>
        <h1 className="mt-3 max-w-2xl font-display text-3xl font-light leading-tight text-paper sm:text-4xl">
          Signal dropped.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-paper/70">
          Something on this page failed to load. A reload usually fixes it.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="group inline-flex items-center gap-1.5 text-paper/80 transition-colors hover:text-accent"
          >
            <RotateCcw size={14} className="transition-transform group-hover:-rotate-45" />
            reload
          </button>
          <a href="/" className="text-paper/80 transition-colors hover:text-accent">
            back home
          </a>
        </div>
      </div>
    )
  }
}
