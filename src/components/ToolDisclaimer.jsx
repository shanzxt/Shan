// Shown wherever an interactive tool appears (/tools, /portfolio, in-issue
// tool panels). Fund names in the tools are data points, not picks.
export default function ToolDisclaimer({ className = "" }) {
  return (
    <p className={`font-mono text-xs leading-relaxed text-paper/65 ${className}`}>
      Educational, not investment advice. Fund names are examples from the dataset, not recommendations.
    </p>
  )
}
