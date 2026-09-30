import { useEffect, useState } from "react"
import { Check, Link2 } from "lucide-react"

// Native share sheet where the browser has one (mostly mobile), otherwise
// copies the page URL.
export default function ShareButton({ title, className = "" }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const onClick = async () => {
    const url = window.location.href.split("#")[0]
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // dismissed share sheet
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt("Copy this link:", url)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 text-paper transition-colors hover:text-accent ${className}`}
    >
      {copied ? <Check size={14} className="text-teal" /> : <Link2 size={14} />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  )
}
