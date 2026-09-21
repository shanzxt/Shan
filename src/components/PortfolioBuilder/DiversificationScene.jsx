import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SPRING_SNAP } from "../../lib/motion";
import HoverDetail from "./HoverDetail";

// Same two colors the correlation heatmap uses, so "amber = moves
// together / teal = moves independently" stays one consistent color
// language across the tool instead of introducing a third meaning.
const TEAL = [0x4e, 0x7c, 0x7a];
const ACCENT = [0xff, 0xb0, 0x00];

const AMPLITUDE = 110; // px — how far a fund's floor position can spread from center
const TILT_DEG = 55; // stage rotateX — viewing angle onto the floor
// Fixed, identical for every fund — purely decorative spacing off the
// floor. Screen height is otherwise a genuine function of floor (x, z)
// only (via the shared group's translate3d + the stage's rotateX/
// perspective), not an arbitrary per-fund value.
const FLOAT_OFFSET = 86;

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function mixColor(c1, c2, t) {
  return `rgb(${Math.round(lerp(c1[0], c2[0], t))}, ${Math.round(lerp(c1[1], c2[1], t))}, ${Math.round(lerp(c1[2], c2[2], t))})`;
}

// Each fund's floor (x, z) is its loading on the selection's own top two
// eigenvectors — the same decomposition already powering effective N, not
// a second one. Funds that load similarly onto the dominant common
// factor(s) land close together on the floor even if their spheres look
// spread apart in the air.
function computeFloorPositions(stats, fundsById) {
  const { eigenvalues, eigenvectors, weights } = stats;
  const selectedIds = [...weights.keys()];
  const n = selectedIds.length;

  const order = eigenvalues.map((_, i) => i).sort((a, b) => eigenvalues[b] - eigenvalues[a]);
  const [k0, k1] = order;

  const projected = selectedIds.map((fid, i) => ({
    fid,
    name: fundsById.get(fid)?.name ?? String(fid),
    loading0: eigenvectors[i][k0],
    loading1: eigenvectors[i][k1],
    x: eigenvectors[i][k0] * Math.sqrt(Math.max(eigenvalues[k0], 0)),
    z: eigenvectors[i][k1] * Math.sqrt(Math.max(eigenvalues[k1], 0)),
  }));

  // The dominant eigenvector's components are almost always same-signed
  // across funds (Perron-Frobenius, given this dataset's mostly-positive
  // correlations) — raw projections all land on one side of the origin,
  // not spread around it. Center on the selection's own mean projection
  // so the floor always centers on what's actually selected; only
  // relative distances between funds carry meaning here, not their
  // position relative to the abstract eigenspace origin.
  const meanX = projected.reduce((s, p) => s + p.x, 0) / n;
  const meanZ = projected.reduce((s, p) => s + p.z, 0) / n;
  const raw = projected.map((p) => ({ ...p, x: p.x - meanX, z: p.z - meanZ }));

  const maxAbs = Math.max(1e-6, ...raw.map((p) => Math.max(Math.abs(p.x), Math.abs(p.z))));
  const scale = AMPLITUDE / maxAbs;

  const scaled = raw.map((p) => ({ ...p, x: p.x * scale, z: p.z * scale }));

  const cx = scaled.reduce((s, p) => s + p.x, 0) / n;
  const cz = scaled.reduce((s, p) => s + p.z, 0) / n;
  const distances = scaled.map((p) => Math.hypot(p.x - cx, p.z - cz));

  let dMin = Math.min(...distances);
  let dMax = Math.max(...distances);
  const degenerate = dMax - dMin < 1;
  if (degenerate) {
    dMin -= 0.5;
    dMax += 0.5;
  }

  // Depth cue: a point's z alone (not x, not index) sets how "far back" on
  // the grid it reads — nearer points render slightly larger/brighter,
  // farther points slightly smaller/dimmer, the same way a real object
  // recedes on a tilted plane. Consistent single source, no per-fund
  // arbitrary jitter.
  const zMin = Math.min(...scaled.map((p) => p.z));
  const zMax = Math.max(...scaled.map((p) => p.z));
  const zSpan = zMax - zMin;

  const rawPoints = scaled.map((p, i) => {
    const t = Math.max(0, Math.min(1, (distances[i] - dMin) / (dMax - dMin)));
    // z is the floor's depth axis: the largest z sits nearest the viewer,
    // so it reads largest/brightest.
    const depthT = zSpan > 1e-6 ? (zMax - p.z) / zSpan : 0.5;
    return {
      ...p,
      shadowColor: mixColor(ACCENT, TEAL, t),
      distance: distances[i],
      depthScale: lerp(1.15, 0.8, depthT),
      depthOpacity: lerp(1, 0.6, depthT),
    };
  });

  // Real fund data regularly puts several near-identical funds on
  // essentially the same floor spot (that's the whole thesis — a "tight
  // cluster" of funds making the same bet). Rendered literally, their
  // spheres/shadows/labels stack into one unreadable blob. Nudge only the
  // ON-SCREEN position apart when points collide, in a small spiral, so a
  // tight cluster reads as "several dots huddled together" instead of a
  // single dot hiding how many funds are really there — renderX/renderZ
  // are display-only, distance/color/isolation logic above already used
  // the real x/z.
  const COLLISION_RADIUS = 15;
  const placedRender = [];
  const nudged = rawPoints.map((p) => {
    let rx = p.x;
    let rz = p.z;
    let attempt = 0;
    while (
      placedRender.some((q) => Math.hypot(rx - q.x, rz - q.z) < COLLISION_RADIUS) &&
      attempt < 12
    ) {
      attempt += 1;
      const angle = attempt * 2.4;
      const radius = COLLISION_RADIUS * 0.55 * attempt;
      rx = p.x + Math.cos(angle) * radius;
      rz = p.z + Math.sin(angle) * radius;
    }
    placedRender.push({ x: rx, z: rz });
    return { ...p, renderX: rx, renderZ: rz };
  });

  // Final fit-to-floor pass. The scaling above normalizes the *projections*,
  // but the anti-collision nudges are added afterwards and can push an
  // outlier past the rendered floor's edge (which is what sent a lone
  // independent fund, plus its tether, off the panel entirely). Rescale all
  // render positions by one shared factor — proportional, never a per-point
  // clamp — so the widest point lands just inside the floor and the
  // relative spread that makes an outlier read as separate is preserved.
  const spread = Math.max(
    1e-6,
    ...nudged.map((p) => Math.max(Math.abs(p.renderX), Math.abs(p.renderZ)))
  );
  const fit = Math.min(1, AMPLITUDE / spread);
  const points = nudged.map((p) => ({
    ...p,
    renderX: p.renderX * fit,
    renderZ: p.renderZ * fit,
  }));

  // Flag a fund whose shadow clearly separates from the rest, for the
  // dynamic callout line — only meaningful with a real "rest" to compare
  // against, and only when the gap is a genuine outlier, not noise.
  let isolated = null;
  if (n >= 3 && !degenerate) {
    const sorted = [...points].sort((a, b) => a.distance - b.distance);
    const farthest = sorted[sorted.length - 1];
    const restMean =
      sorted.slice(0, -1).reduce((s, p) => s + p.distance, 0) / (sorted.length - 1);
    if (farthest.distance > restMean * 1.6) {
      isolated = farthest;
    }
  }

  // Which shadows actually read as "the same bet" vs. "its own thing" — for
  // the on-floor cluster/outlier labels. The cluster is every point except
  // the flagged isolated one (or, when nothing is isolated, the whole
  // selection — e.g. the all-equity preset, where there's no outlier to
  // split off). Bounds are padded past the shadows themselves and floored
  // at a minimum size so a genuinely tight cluster (the interesting case —
  // several shadows nearly on top of each other) still draws a visible ring
  // rather than collapsing to nothing.
  const clusterPoints = isolated ? points.filter((p) => p.fid !== isolated.fid) : points;
  let clusterBounds = null;
  if (clusterPoints.length >= 2) {
    const xs = clusterPoints.map((p) => p.renderX);
    const zs = clusterPoints.map((p) => p.renderZ);
    const PAD = 26;
    const MIN_SIZE = 56;
    clusterBounds = {
      cx: (Math.min(...xs) + Math.max(...xs)) / 2,
      cz: (Math.min(...zs) + Math.max(...zs)) / 2,
      w: Math.max(Math.max(...xs) - Math.min(...xs) + PAD * 2, MIN_SIZE),
      h: Math.max(Math.max(...zs) - Math.min(...zs) + PAD * 2, MIN_SIZE),
    };
  }

  return { points, isolated, clusterBounds };
}

// Static, non-interactive callout showing the encoding once, in isolation,
// before the reader looks at the real (data-driven) scene below — visually
// distinct (dashed border, smaller scale, muted) so it reads as a legend,
// never mistaken for another data point.
function ReadingLegend() {
  return (
    <div className="mx-auto flex w-full max-w-xs items-center gap-3 rounded-md border border-dashed hr-line bg-paper/[0.03] px-3 py-2.5">
      <div className="relative h-16 w-8 shrink-0">
        <div
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full border hr-line"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, rgba(237, 234, 226, 0.9), rgba(237, 234, 226, 0.35) 70%)",
          }}
        />
        <div
          className="absolute left-1/2 top-3 w-px -translate-x-1/2"
          style={{
            height: 34,
            background:
              "linear-gradient(to bottom, rgba(237, 234, 226, 0.45) 0%, rgba(237, 234, 226, 0.1) 100%)",
          }}
        />
        <div
          className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
          style={{ top: 46, background: "var(--color-accent)", opacity: 0.85 }}
        />
      </div>
      <div className="flex flex-col gap-1 font-mono text-[10px] leading-tight text-paper/45">
        <span>sphere — a fund</span>
        <span>line — just spacing, ignore the length</span>
        <span>shadow — where it really sits, based on how it moves with the others</span>
      </div>
    </div>
  );
}

export default function DiversificationScene({ stats, fundsById }) {
  const [hovered, setHovered] = useState(null);

  const scene = useMemo(() => {
    if (!stats || stats.n_funds_selected < 2) return null;
    return computeFloorPositions(stats, fundsById);
  }, [stats, fundsById]);

  if (!scene) return null;

  const { points, isolated, clusterBounds } = scene;
  const n = points.length;
  const isolatedIndex = isolated ? points.findIndex((p) => p.fid === isolated.fid) + 1 : null;
  const hoveredPoint = hovered !== null ? points.find((p) => p.fid === hovered) : null;
  const hoveredIndex = hoveredPoint ? points.indexOf(hoveredPoint) + 1 : null;

  return (
    <div className="flex flex-col gap-4 rounded-lg border hr-line p-5">
      <div>
        <span className="font-mono text-xs tracking-wide text-teal">
          what looks like vs. what actually is
        </span>
        <p className="mt-1 max-w-md text-[13px] text-paper/60">
          Up here, your {n} funds look spread apart. Down on the ground — where
          risk actually lands — most are standing in nearly the same spot.
        </p>
        {isolated && (
          <p className="mt-1 max-w-md text-[13px] text-teal">
            Fund {isolatedIndex} — {isolated.name}'s shadow lands clearly apart
            from the rest, ringed below — a real diversification win, not
            just a different-looking fund.
          </p>
        )}
      </div>

      <ReadingLegend />

      <div className="mx-auto mt-4 w-full max-w-sm" style={{ perspective: 900 }}>
        <motion.div
          className="relative"
          style={{ height: 320, transformStyle: "preserve-3d" }}
          animate={{ rotateY: [-6, 6, -6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0"
            style={{ transform: `rotateX(${TILT_DEG}deg)`, transformStyle: "preserve-3d" }}
          >
            {/* Floor grid — decorative, sits in the same z=0 plane as every shadow below. */}
            <div
              className="absolute rounded-md border hr-line opacity-40"
              style={{
                left: "50%",
                top: "50%",
                width: AMPLITUDE * 2.6,
                height: AMPLITUDE * 2.6,
                transform: "translate3d(-50%, -50%, 0)",
                backgroundImage:
                  "repeating-linear-gradient(0deg, var(--color-paper) 0, var(--color-paper) 1px, transparent 1px, transparent 34px), repeating-linear-gradient(90deg, var(--color-paper) 0, var(--color-paper) 1px, transparent 1px, transparent 34px)",
                backgroundSize: "34px 34px",
                backgroundColor: "rgba(0,0,0,0.15)",
              }}
            />

            {/* Shared direction, cluster centroid -> isolated point. The
                cluster label is pushed to the opposite side of the ring from
                the isolated point, and the isolated label is pushed further
                out beyond the isolated point in the same direction — so the
                two labels always move apart from each other instead of
                landing on top of one another, whichever way the isolated
                fund happens to sit relative to the cluster this selection. */}
            {(() => {
              if (!clusterBounds) return null;
              const dir = isolated
                ? (() => {
                    const dx = isolated.renderX - clusterBounds.cx;
                    const dz = isolated.renderZ - clusterBounds.cz;
                    const dist = Math.hypot(dx, dz) || 1;
                    return { x: dx / dist, z: dz / dist };
                  })()
                : { x: 0, z: 1 };
              return (
                <>
                  {/* cluster ring + label — makes "these shadows are close
                      together" explicit on the floor itself instead of
                      asking the reader to eyeball it. Amber, matching the
                      heatmap's "moves together" color; covers every shadow
                      except the isolated one (or the whole selection when
                      nothing is isolated). */}
                  <div
                    className="absolute rounded-full border border-dashed"
                    style={{
                      left: `calc(50% + ${clusterBounds.cx}px)`,
                      top: `calc(50% + ${clusterBounds.cz}px)`,
                      width: clusterBounds.w,
                      height: clusterBounds.h,
                      transform: "translate(-50%, -50%)",
                      borderColor: "var(--color-accent)",
                      opacity: 0.3,
                    }}
                  />
                  <div
                    className="absolute select-none whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wide"
                    style={{
                      left: `calc(50% + ${clusterBounds.cx - dir.x * (clusterBounds.w / 2 + 14)}px)`,
                      top: `calc(50% + ${clusterBounds.cz - dir.z * (clusterBounds.h / 2 + 14)}px)`,
                      transform: "translate(-50%, -50%)",
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "var(--color-accent)",
                      opacity: 0.85,
                    }}
                  >
                    these move almost identically
                  </div>

                  {/* isolated label — teal, matching the heatmap's "moves
                      independently" color; sits beside the ringed shadow so
                      the reading doesn't depend on the paragraph text
                      above. */}
                  {isolated && (
                    <div
                      className="absolute select-none whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wide"
                      style={{
                        left: `calc(50% + ${isolated.renderX + dir.x * 26}px)`,
                        top: `calc(50% + ${isolated.renderZ + dir.z * 26}px)`,
                        transform: "translate(-50%, -50%)",
                        background: "rgba(0, 0, 0, 0.5)",
                        color: "var(--color-teal)",
                        opacity: 0.9,
                      }}
                    >
                      moves on its own
                    </div>
                  )}
                </>
              );
            })()}

            {points.map((p, i) => {
              const isIsolated = isolated?.fid === p.fid;
              const hoverProps = {
                onPointerEnter: () => setHovered(p.fid),
                onPointerLeave: () => setHovered(null),
                onClick: () => setHovered(p.fid),
              };
              return (
                <motion.div
                  key={p.fid}
                  className="absolute"
                  style={{ left: "50%", top: "50%", transformStyle: "preserve-3d" }}
                  // x and y are the two in-plane floor axes (y is depth on the
                  // tilted floor); height off the floor is the plane's normal,
                  // handled per-element below with translateZ.
                  animate={{ x: p.renderX, y: p.renderZ }}
                  transition={SPRING_SNAP}
                >
                  {/* connecting beam — the one element that makes "floating fund" and
                      "where it actually lands" read as the same object, not two
                      unrelated dots. Fixed length (FLOAT_OFFSET), fades toward the
                      floating end. */}
                  <div
                    className="absolute"
                    style={{
                      left: -1,
                      top: -FLOAT_OFFSET,
                      width: 2,
                      height: FLOAT_OFFSET,
                      // Stood up perpendicular to the floor plane, so it
                      // always runs from the shadow to the sphere directly
                      // above it and can never stretch off the panel.
                      transformOrigin: "bottom center",
                      transform: "rotateX(-90deg)",
                      background:
                        "linear-gradient(to top, rgba(237, 234, 226, 0.45) 0%, rgba(237, 234, 226, 0.04) 100%)",
                      opacity: p.depthOpacity,
                    }}
                  />

                  {/* isolation ring — visually ties the dynamic callout sentence to a
                      specific dot instead of asking the reader to take it on faith. */}
                  {isIsolated && (
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        left: -16,
                        top: -16,
                        width: 32,
                        height: 32,
                        border: "1.5px solid var(--color-teal)",
                      }}
                      animate={{ opacity: [0.85, 0.35, 0.85], scale: [1, 1.12, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {/* shadow — stays on the floor plane; this is the "actual" position.
                      Color is the only place amber/teal cluster meaning lives. */}
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      left: -9,
                      top: -9,
                      width: 18,
                      height: 18,
                      filter: "blur(1px)",
                      cursor: "pointer",
                    }}
                    {...hoverProps}
                    animate={{
                      backgroundColor: p.shadowColor,
                      opacity: 0.85 * p.depthOpacity,
                      scale: p.depthScale,
                    }}
                    transition={SPRING_SNAP}
                    title={p.name}
                  />

                  {/* sphere — floats up from the floor on first reveal. Neutral/muted
                      only, so color meaning stays exclusive to the shadow below it. */}
                  <motion.div
                    className="absolute rounded-full border hr-line"
                    style={{
                      left: -7,
                      top: -7,
                      width: 14,
                      height: 14,
                      background:
                        "radial-gradient(circle at 35% 30%, rgba(237, 234, 226, 0.9), rgba(237, 234, 226, 0.35) 70%)",
                      boxShadow: "0 0 10px rgba(237, 234, 226, 0.35)",
                      cursor: "pointer",
                    }}
                    initial={{ z: 0, opacity: 0, scale: p.depthScale }}
                    whileInView={{ z: FLOAT_OFFSET, opacity: p.depthOpacity, scale: p.depthScale }}
                    viewport={{ once: true, amount: 0.4 }}
                    animate={{ z: FLOAT_OFFSET, opacity: p.depthOpacity, scale: p.depthScale }}
                    transition={SPRING_SNAP}
                    title={p.name}
                    {...hoverProps}
                  />

                  {/* persistent numeric label — identifies the fund at a glance,
                      matching the same 1..n convention the correlation heatmap's
                      row/column labels use, without requiring hover. */}
                  <div
                    className="absolute select-none whitespace-nowrap rounded px-1 font-mono text-[9px] leading-[14px]"
                    style={{
                      left: 10,
                      top: -5,
                      transform: `translateZ(${FLOAT_OFFSET}px)`,
                      background: "rgba(0, 0, 0, 0.45)",
                      color: isIsolated ? "var(--color-teal)" : "var(--color-paper)",
                      opacity: p.depthOpacity,
                    }}
                  >
                    {i + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <HoverDetail placeholder="Shadows close together = funds that move almost identically. A shadow standing apart = a fund that actually moves on its own. Hover or tap a sphere for the fund and its loadings.">
        {hoveredPoint ? (
          <span>
            <span className="text-paper/40">{hoveredIndex}. </span>
            <span className="text-paper/90">{hoveredPoint.name}</span>
            <span className="text-accent">
              {" "}
              · main factor {hoveredPoint.loading0.toFixed(3)}
            </span>
            <span className="text-teal"> · second {hoveredPoint.loading1.toFixed(3)}</span>
          </span>
        ) : null}
      </HoverDetail>

      <div className="grid grid-cols-1 overflow-hidden rounded-lg border hr-line sm:grid-cols-2">
        {points.map((p, i) => {
          const isIsolated = isolated?.fid === p.fid;
          return (
            <div
              key={p.fid}
              onPointerEnter={() => setHovered(p.fid)}
              onPointerLeave={() => setHovered(null)}
              className={`flex items-center gap-2 border-t hr-line px-3 py-2 text-left text-sm transition-colors ${
                hovered === p.fid ? "bg-paper/5" : ""
              } ${isIsolated ? "text-teal" : "text-paper/70"}`}
            >
              <span className="w-4 shrink-0 font-mono text-[11px] text-paper/35">{i + 1}</span>
              <span className="truncate" title={p.name}>
                {p.name}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-paper/35">
        Each sphere's shadow is the fund's real position — its loading on the
        dominant shared factor(s) behind your current selection. The line
        between them is just the tether; height and size are depth cues, not
        data.
      </p>
    </div>
  );
}
