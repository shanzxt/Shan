import { useMemo, useState } from "react";

// Hardcoded to match the site's actual --color-accent/--color-teal/--color-bg
// tokens (index.css) — needed as literal hex here because SVG fill
// interpolation happens in JS, not CSS, so var() alone can't be blended.
const TEAL = [0x4e, 0x7c, 0x7a];
const ACCENT = [0xff, 0xb0, 0x00];

// Above this many funds, in-cell numbers start overlapping/becoming
// illegible (n^2 cells shrinking fast) — fall back to color-only.
const MAX_FUNDS_FOR_CELL_TEXT = 10;

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function mix(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

function rgbStr(c) {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

// Perceived luminance (0-255) — decides whether a cell needs dark or light
// text on top of it, so the printed correlation number stays readable
// against every color the scale produces.
function luminance([r, g, b]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Direct hue blend from teal (low end of the current range) to amber (high
// end) — NOT a fade through the dark bg. Mixing through bg at the midpoint
// meant any positive r (the overwhelming majority of real pairs here) only
// ever mixed toward amber, so cells only varied in amber's lightness and
// never actually read as teal-shifted.
//
// `domainMin`/`domainMax` anchor the gradient to the actual spread of
// correlations in the CURRENT selection, not a fixed -1..1 range — real
// pairs in this dataset almost never go far negative, so a fixed range
// compresses everything into a narrow, muted band near the amber end. The
// same raw correlation value can therefore render differently depending on
// what else is selected — that's intentional: the scale shows relative
// spread within what's actually on screen, not an absolute universal one.
function colorForCorrelation(r, domainMin, domainMax) {
  const span = domainMax - domainMin;
  const t = span > 1e-9 ? (r - domainMin) / span : 0.5;
  const clampedT = Math.max(0, Math.min(1, t));
  return mix(TEAL, ACCENT, clampedT);
}

const CELL = 100;
const LABEL_SPACE = 26;

function Legend({ min, max }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-2 w-full max-w-xs rounded-full border hr-line"
        style={{
          background: `linear-gradient(to right, ${rgbStr(ACCENT)}, ${rgbStr(TEAL)})`,
        }}
      />
      <div className="flex w-full max-w-xs justify-between font-mono text-[10px] text-paper/40">
        <span className="flex flex-col items-start gap-0.5">
          <span>moves together</span>
          {max !== null && <span className="text-paper/60">{max.toFixed(2)}</span>}
        </span>
        <span className="flex flex-col items-end gap-0.5">
          <span>moves independently</span>
          {min !== null && <span className="text-paper/60">{min.toFixed(2)}</span>}
        </span>
      </div>
    </div>
  );
}

export default function CorrelationHeatmap({ fundIds, fundsById, corr }) {
  const [hovered, setHovered] = useState(null);

  // Off-diagonal pairs only — a fund's correlation with itself is always
  // exactly 1 and would otherwise pin the amber end of the scale at 1
  // regardless of how correlated the selection's actual distinct pairs
  // are, defeating the point of anchoring to the real observed spread.
  const { domainMin, domainMax } = useMemo(() => {
    if (fundIds.length < 2) return { domainMin: null, domainMax: null };
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < fundIds.length; i++) {
      for (let j = 0; j < fundIds.length; j++) {
        if (i === j) continue;
        const v = corr.get(fundIds[i])?.get(fundIds[j]) ?? 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    // Degenerate case (e.g. exactly 2 funds -> a single pair value,
    // symmetric so min === max): widen slightly so the gradient/text-color
    // logic below has a real span to divide by instead of collapsing.
    if (max - min < 0.02) {
      min -= 0.01;
      max += 0.01;
    }
    return { domainMin: min, domainMax: max };
  }, [fundIds, corr]);

  const caption = (
    <>
      <span className="font-mono text-xs tracking-wide text-teal">correlation heatmap</span>
      <p className="max-w-md text-[13px] text-paper/60">
        Each square shows how closely two funds move together, scaled to the
        spread actually present in your current selection. Bright amber =
        they rise and fall almost in lockstep. Dark teal = one goes its own
        way. A portfolio that's all bright squares isn't as diversified as it
        looks.
      </p>
      <Legend min={domainMin} max={domainMax} />
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
  const showCellText = n <= MAX_FUNDS_FOR_CELL_TEXT;

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
              const rgb = colorForCorrelation(value, domainMin, domainMax);
              const textColor = luminance(rgb) > 140 ? "var(--color-bg)" : "var(--color-paper)";
              return (
                <g key={`${fidA}-${fidB}`}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    fill={rgbStr(rgb)}
                    stroke="var(--color-bg)"
                    strokeWidth={2}
                    opacity={isHovered ? 1 : 0.92}
                    style={{ cursor: "pointer" }}
                  />
                  {showCellText && (
                    <text
                      x={x + CELL / 2}
                      y={y + CELL / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={18}
                      fontFamily="'IBM Plex Mono', monospace"
                      fill={textColor}
                      opacity={0.85}
                      pointerEvents="none"
                    >
                      {value.toFixed(2)}
                    </text>
                  )}
                </g>
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
