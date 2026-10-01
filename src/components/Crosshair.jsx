import { useRef, useState } from "react"

// The signature interaction: a chart-style crosshair that measures. Hover
// (or tap and drag on touch) and two hairlines lock onto the nearest real
// data point; a small statement box shows its value. `read(fx, fy)` gets
// the pointer as fractions of this box and returns the snapped point,
// `{ x, y, label, value }` (x/y also fractions), or null for no reading.
// The site's probe cursor steps aside here (data-cursor="measure") so
// there is only ever one crosshair on screen.
//
// Nothing moves on its own: the lines follow the reader's hand only, so the
// same behaviour is the reduced-motion version (no easing on the lines).
export default function Crosshair({ read, onRead, className = "", style, children }) {
  const ref = useRef(null)
  const [hit, setHit] = useState(null)
  const [width, setWidth] = useState(0)

  const measure = (e) => {
    const r = ref.current.getBoundingClientRect()
    const fx = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1)
    const fy = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1)
    const next = read(fx, fy)
    setWidth(r.width)
    setHit(next)
    onRead?.(next)
  }
  const clear = () => {
    setHit(null)
    onRead?.(null)
  }

  // the box sits right of the point unless that would run off the edge
  const flip = hit && hit.x * width > width - 270
  const low = hit && hit.y < 0.3

  return (
    <div
      ref={ref}
      data-cursor="measure"
      className={`touch-pan-y select-none ${className}`}
      style={style}
      onPointerMove={measure}
      onPointerDown={measure}
      onPointerLeave={(e) => e.pointerType === "mouse" && clear()}
      onPointerCancel={clear}
    >
      {children}
      {hit && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute inset-y-0 w-px bg-accent/55" style={{ left: `${hit.x * 100}%` }} />
          <span className="absolute inset-x-0 h-px bg-accent/35" style={{ top: `${hit.y * 100}%` }} />
          <span
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-bg shadow-phosphor"
            style={{ left: `${hit.x * 100}%`, top: `${hit.y * 100}%` }}
          />
          <div
            className="panel absolute z-10 min-w-[9.5rem] px-3 py-2"
            style={{
              left: `${hit.x * 100}%`,
              top: `${hit.y * 100}%`,
              transform: `translate(${flip ? "calc(-100% - 14px)" : "14px"}, ${low ? "14px" : "calc(-100% - 14px)"})`,
            }}
          >
            <p className="engraved whitespace-nowrap text-paper/65">{hit.label}</p>
            <p className="mt-0.5 font-mono text-[15px] font-medium tabular-nums text-accent">{hit.value}</p>
            {hit.note && <p className="engraved mt-1 max-w-[16rem] text-paper/60">{hit.note}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
