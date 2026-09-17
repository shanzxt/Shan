import { useState } from "react";

// Hardcoded to match the site's actual --color-accent/--color-teal/--color-bg
// tokens (index.css) — needed as literal hex here because SVG fill
// interpolation happens in JS, not CSS, so var() alone can't be blended.
const TEAL = [0x4e, 0x7c, 0x7a];
const BG = [0x12, 0x15, 0x1a];
const ACCENT = [0xff, 0xb0, 0x00];

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function mix(c1, c2, t) {
  return `rgb(${lerp(c1[0], c2[0], t)}, ${lerp(c1[1], c2[1], t)}, ${lerp(c1[2], c2[2], t)})`;
}

// -1..0 fades teal -> dark bg, 0..1 rises from dark bg -> amber, so the
// bg genuinely "shows through" at low/negative correlation rather than
// just being one end of a two-color gradient.
function colorForCorrelation(r) {
  const clamped = Math.max(-1, Math.min(1, r));
  if (clamped <= 0) {
    return mix(BG, TEAL, -clamped);
  }
  return mix(BG, ACCENT, clamped);
}

const CELL = 100;
const LABEL_SPACE = 26;

export default function CorrelationHeatmap({ fundIds, fundsById, corr }) {
  const [hovered, setHovered] = useState(null);

  if (fundIds.length < 2) {
    return (
      <div className="rounded-lg border hr-line px-4 py-6 text-center text-sm text-paper/40">
        Select at least two funds to see their correlation heatmap.
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
      <span className="font-mono text-xs tracking-wide text-teal">correlation heatmap</span>
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
