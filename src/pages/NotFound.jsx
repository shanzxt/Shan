import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-bg px-6 pb-24 pt-28 sm:px-10 lg:px-16">
      <p className="font-mono text-sm text-teal">404</p>
      <h1 className="mt-3 max-w-2xl font-display text-3xl font-light leading-tight text-paper sm:text-4xl">
        Nothing on this frequency.
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-paper/70">
        The page you asked for doesn't exist, or it moved.
      </p>
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 text-paper/80 transition-colors hover:text-accent"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          back home
        </Link>
        <Link to="/newsletters" className="text-paper/80 transition-colors hover:text-accent">
          all issues
        </Link>
      </div>
    </div>
  )
}
