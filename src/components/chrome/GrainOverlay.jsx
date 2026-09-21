// Always-on texture overlay — cheap, low-opacity SVG noise over the whole
// viewport so the flat dark background reads as considered rather than
// empty. Site-wide, mounted once outside <Routes> in App.jsx.
export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 opacity-[0.16] mix-blend-overlay"
    >
      <svg className="h-full w-full">
        <filter id="site-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#site-grain)" />
      </svg>
    </div>
  )
}
