// A figure with its currency sign set the way statements do it: the ₹ small,
// raised and in the mono face, the number large. It also keeps "₹" out of
// the display and body fonts, whose latin-ext files would otherwise be
// downloaded for that one glyph (+80 kB on first load); Martian Mono's
// already ships with the page.
export default function Amount({ value }) {
  const s = String(value)
  if (!s.startsWith("₹")) return s
  return (
    <>
      <span className="mr-[0.04em] inline-block -translate-y-[0.55em] font-mono text-[0.42em] font-medium tracking-normal">₹</span>
      {s.slice(1)}
    </>
  )
}
