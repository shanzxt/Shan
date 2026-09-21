// The one "hover or tap something for the exact number" line, shared by the
// correlation heatmap and the diversification scene so both read as the same
// affordance instead of two competing tooltip styles.
export default function HoverDetail({ placeholder, children }) {
  return (
    <div className="flex min-h-[3rem] items-center justify-center rounded-md border hr-line px-4 py-2 text-center font-mono text-xs tabular-nums text-paper/70">
      {children ?? <span className="text-paper/30">{placeholder}</span>}
    </div>
  );
}
