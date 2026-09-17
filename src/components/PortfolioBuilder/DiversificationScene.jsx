import { useMemo } from "react";
import { motion } from "framer-motion";
import { SPRING_SNAP } from "../../lib/motion";

// Same two colors the correlation heatmap uses, so "amber = moves
// together / teal = moves independently" stays one consistent color
// language across the tool instead of introducing a third meaning.
const TEAL = [0x4e, 0x7c, 0x7a];
const ACCENT = [0xff, 0xb0, 0x00];

const AMPLITUDE = 110; // px — how far a fund's floor position can spread from center
const TILT_DEG = 55; // stage rotateX — viewing angle onto the floor
const HEIGHTS = [72, 96, 58, 88, 108, 64, 92, 78, 110, 68]; // decorative float heights, cycled by index

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

  const scaled = raw.map((p, i) => ({
    ...p,
    x: p.x * scale,
    z: p.z * scale,
    height: HEIGHTS[i % HEIGHTS.length],
  }));

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

  const points = scaled.map((p, i) => {
    const t = Math.max(0, Math.min(1, (distances[i] - dMin) / (dMax - dMin)));
    return { ...p, shadowColor: mixColor(ACCENT, TEAL, t), distance: distances[i] };
  });

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

  return { points, isolated };
}

export default function DiversificationScene({ stats, fundsById }) {
  const scene = useMemo(() => {
    if (!stats || stats.n_funds_selected < 2) return null;
    return computeFloorPositions(stats, fundsById);
  }, [stats, fundsById]);

  if (!scene) return null;

  const { points, isolated } = scene;
  const n = points.length;

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
            {isolated.name}'s shadow lands clearly apart from the rest — a real
            diversification win, not just a different-looking fund.
          </p>
        )}
      </div>

      <div className="mx-auto w-full max-w-sm" style={{ perspective: 900 }}>
        <motion.div
          className="relative"
          style={{ height: 260, transformStyle: "preserve-3d" }}
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

            {points.map((p) => (
              <motion.div
                key={p.fid}
                className="absolute"
                style={{ left: "50%", top: "50%", transformStyle: "preserve-3d" }}
                animate={{ x: p.x, z: p.z }}
                transition={SPRING_SNAP}
              >
                {/* shadow — stays on the floor plane; this is the "actual" position */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    left: -9,
                    top: -9,
                    width: 18,
                    height: 18,
                    filter: "blur(1px)",
                  }}
                  animate={{ backgroundColor: p.shadowColor, opacity: 0.85 }}
                  transition={SPRING_SNAP}
                  title={p.name}
                />
                {/* sphere — floats up from the floor on first reveal, decorative height only */}
                <motion.div
                  className="absolute rounded-full border hr-line"
                  style={{
                    left: -7,
                    top: -7,
                    width: 14,
                    height: 14,
                    background: "rgba(237, 234, 226, 0.55)",
                    boxShadow: "0 0 10px rgba(237, 234, 226, 0.35)",
                  }}
                  initial={{ y: 0, opacity: 0 }}
                  whileInView={{ y: -p.height, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  animate={{ y: -p.height }}
                  transition={SPRING_SNAP}
                  title={p.name}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <p className="text-center text-[11px] text-paper/35">
        Height is just spacing so the spheres don't overlap. The shadow below
        each one is the fund's real position — its loading on the dominant
        shared factor(s) behind your current selection.
      </p>
    </div>
  );
}
