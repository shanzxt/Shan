import { useState } from "react";

// Hardcoded to match the site's actual --color-accent/--color-teal/--color-bg
// tokens (index.css) — needed as literal hex here because SVG fill
// interpolation happens in JS, not CSS, so var() alone can't be blended.
const TEAL = [0x4e, 0x7c, 0x7a];
const ACCENT = [0xff, 0xb0, 0x00];

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function mix(c1, c2, t) {
  return `rgb(${lerp(c1[0], c2[0], t)}, ${lerp(c1[1], c2[1], t)}, ${lerp(c1[2], c2[2], t)})`;
}

function rgbStr(c) {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

// Direct hue blend from teal (r = -1, "moves independently") to amber
// (r = +1, "moves together") — NOT a fade through the dark bg. Mixing
// through bg at r = 0 meant any positive r (the overwhelming majority of
// real pairs here) only ever mixed toward amber, so cells only varied in
// amber's lightness and never actually read as teal-shifted, even for
// comparatively low-but-still-positive correlations. Must match the
// legend gradient exactly (see Legend below) — same two colors, same t.
function colorForCorrelation(r) {
  const clamped = Math.max(-1, Math.min(1, r));
  const t = (clamped + 1) / 2;
  return mix(TEAL, ACCENT, t);
}

const CELL = 100;
const LABEL_SPACE = 26;

function Legend() {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-2 w-full max-w-xs rounded-full border hr-line"
        style={{
          background: `linear-gradient(to right, ${rgbStr(ACCENT)}, ${rgbStr(TEAL)})`,
        }}
      />
      <div className="flex w-full max-w-xs justify-between font-mono text-[10px] text-paper/40">
        <span>moves together</span>
        <span></span>
        <span>moves independently</span>
      </div>
    </div>
  );
}

export default function CorrelationHeatmap({ fundIds, fundsById, corr }) {
  const [hovered, setHovered] = useState(null);

  const caption = (
    <>
      <span className="font-mono text-xs tracking-wide text-teal">correlation heatmap</span>
      <p className="max-w-md text-[13px] text-paper/60">
        Each square shows how closely two funds move together. Bright amber =
        they rise and fall almost in lockstep. Dark = one goes its own way. A
        portfolio that's all bright squares isn't as diversified as it looks.
      </p>
      <Legend />
    </>
  );

  if (fundIds.length < 2) {
    return (
      <div className="flex flex-col gap-3">
        {caption}
        <div className="rounded-lg border hr-line px-4 py-6 text-center text-sm text-paper/40">
          Select at least two funds to see their correlation heatmap.
        </div>
      </div>
    );
  }

  const n = fundIds.length;
  const size = LABEL_SPACE + n * CELL;

  // A single pointer-position handler on the <svg> (mapping coordinates to
  // a cell) instead of onMouseEnter/onMouseLeave per <rect> — with ~n^2
  // cells, per-cell listeners caused enter/leave to thrash across cell
  // boundaries during a single mousemove and briefly froze the tab.
  function cellFromEvent(e) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scale = size / rect.width;
    const px = (e.clientX - rect.left) * scale;
    const py = (e.clientY - rect.top) * scale;
    const j = Math.floor((px - LABEL_SPACE) / CELL);
    const i = Math.floor((py - LABEL_SPACE) / CELL);
    if (i < 0 || i >= n || j < 0 || j >= n) return null;
    const fidA = fundIds[i];
    const fidB = fundIds[j];
    return { i, j, fidA, fidB, value: corr.get(fidA)?.get(fidB) ?? 0 };
  }

  return (
    <div className="flex flex-col gap-3">
      {caption}
      <div className="relative">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full"
          style={{ maxHeight: 420 }}
          onMouseMove={(e) => setHovered(cellFromEvent(e))}
          onMouseLeave={() => setHovered(null)}
          onTouchStart={(e) => setHovered(cellFromEvent(e.touches[0]))}
        >
          {fundIds.map((fidA, i) =>
            fundIds.map((fidB, j) => {
              const value = corr.get(fidA)?.get(fidB) ?? 0;
              const x = LABEL_SPACE + j * CELL;
              const y = LABEL_SPACE + i * CELL;
              const isHovered = hovered && hovered.i === i && hovered.j === j;
              return (
                <rect
                  key={`${fidA}-${fidB}`}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  fill={colorForCorrelation(value)}
                  stroke="var(--color-bg)"
                  strokeWidth={2}
                  opacity={isHovered ? 1 : 0.92}
                  style={{ cursor: "pointer" }}
                />
              );
            })
          )}
          {fundIds.map((fid, i) => (
            <text
              key={`row-${fid}`}
              x={LABEL_SPACE - 4}
              y={LABEL_SPACE + i * CELL + CELL / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={9}
              fontFamily="'IBM Plex Mono', monospace"
              fill="var(--color-paper)"
              opacity={0.4}
            >
              {i + 1}
            </text>
          ))}
          {fundIds.map((fid, j) => (
            <text
              key={`col-${fid}`}
              x={LABEL_SPACE + j * CELL + CELL / 2}
              y={LABEL_SPACE - 8}
              textAnchor="middle"
              fontSize={9}
              fontFamily="'IBM Plex Mono', monospace"
              fill="var(--color-paper)"
              opacity={0.4}
            >
              {j + 1}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex min-h-[3rem] items-center justify-center rounded-md border hr-line px-4 py-2 text-center font-mono text-xs tabular-nums text-paper/70">
        {hovered ? (
          <span>
            <span className="text-paper/90">
              {fundsById.get(hovered.fidA)?.name}
            </span>
            <span className="text-paper/40"> vs </span>
            <span className="text-paper/90">
              {fundsById.get(hovered.fidB)?.name}
            </span>
            <span className="text-accent"> · {hovered.value.toFixed(3)}</span>
          </span>
        ) : (
          <span className="text-paper/30">Hover or tap a cell for the exact correlation.</span>
        )}
      </div>
    </div>
  );
}
