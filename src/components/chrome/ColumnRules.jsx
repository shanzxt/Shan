// The desk's ruling: twelve column hairlines locked to the page container,
// fixed behind every route, plus a soft vignette over the viewport edges.
// Content aligns to these lines, so the grid is visible rather than implied.
// Desktop only; on phones a single column needs no ruling (and the hero
// carries its own vignette).
export default function ColumnRules() {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 hidden print:hidden lg:block">
        <div className="mx-auto grid h-full max-w-[1600px] grid-cols-12 gap-4 px-12">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="h-full border-x border-paper/[0.025]" />
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="vignette pointer-events-none fixed inset-0 z-30 hidden print:hidden lg:block" />
    </>
  )
}
