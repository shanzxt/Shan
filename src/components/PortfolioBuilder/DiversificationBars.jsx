import { motion } from "framer-motion";
import { EASE_OUT } from "../../lib/motion";

// "Illusion" bar segments — deliberately neutral/muted, alternating two
// tones only so adjacent equal-weight funds stay visually separable. This
// bar shouldn't compete with the amber "here's the real concentration"
// moment below it.
const NEUTRAL_COLORS = ["rgba(237, 234, 226, 0.22)", "rgba(237, 234, 226, 0.12)"];

// Segments below this share of total variance get folded into a single
// "the rest" segment rather than each getting an unreadable sliver label.
const MIN_LABEL_SHARE = 0.08;

export default function DiversificationBars({ stats, fundsById }) {
  if (!stats || stats.n_funds_selected < 2) return null;

  const n = stats.n_funds_selected;

  const topSegments = [...stats.weights.entries()].map(([fid, w], i) => ({
    key: fid,
    pct: w * 100,
    name: fundsById.get(fid)?.name ?? String(fid),
    index: i + 1,
  }));

  // Eigenvalues aren't tied to individual funds (they're the selection's
  // underlying independent factors), so sort by share and group the long
  // tail rather than trying to label them per-fund like the top bar.
  const sortedShares = [...stats.eigenvalues].sort((a, b) => b - a).map((ev) => ev / n);
  const bottomSegments = [];
  let restShare = 0;
  sortedShares.forEach((share, i) => {
    // Always label the single largest factor, even below the threshold,
    // so the bar always has a real anchor color rather than reading as
    // "all rest" when a portfolio happens to be genuinely well-diversified.
    if (share >= MIN_LABEL_SHARE || i === 0) {
      bottomSegments.push({
        key: `factor-${i}`,
        pct: share * 100,
        label: `factor ${bottomSegments.length + 1}`,
        isRest: false,
        rank: bottomSegments.length,
      });
    } else {
      restShare += share;
    }
  });
  if (restShare > 1e-6) {
    bottomSegments.push({ key: "rest", pct: restShare * 100, label: "the rest", isRest: true });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border hr-line p-5">
      <div>
        <span className="font-mono text-xs tracking-wide text-teal">
          what it looks like vs. what it actually is
        </span>
        <p className="mt-1 max-w-md text-[13px] text-paper/60">
          You spread money across {n} funds evenly. The market doesn't see it
          that way — most of the risk comes from a much smaller number of
          underlying forces.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] text-paper/40">what it looks like you own</span>
        <div className="flex h-9 w-full overflow-hidden rounded-md border hr-line">
          {topSegments.map((seg, idx) => (
            <motion.div
              key={seg.key}
              initial={false}
              animate={{ width: `${seg.pct}%` }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="flex h-full items-center justify-center overflow-hidden border-r hr-line last:border-r-0"
              style={{ background: NEUTRAL_COLORS[idx % NEUTRAL_COLORS.length] }}
              title={seg.name}
            >
              {seg.pct > 10 && (
                <span className="truncate px-1 font-mono text-[10px] text-paper/70">
                  {seg.name}
                </span>
              )}
            </motion.div>
          ))}
        </div>
        {topSegments.some((s) => s.pct <= 10) && (
          <p className="text-[11px] leading-relaxed text-paper/35">
            {topSegments.map((s) => `${s.index}. ${s.name}`).join("  ·  ")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] text-paper/40">what you actually own</span>
        <div className="flex h-9 w-full overflow-hidden rounded-md border hr-line">
          {bottomSegments.map((seg) => (
            <motion.div
              key={seg.key}
              initial={false}
              animate={{ width: `${seg.pct}%` }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="flex h-full items-center justify-center overflow-hidden border-r hr-line last:border-r-0"
              style={{
                background: seg.isRest
                  ? "var(--color-teal)"
                  : `rgba(255, 176, 0, ${Math.max(0.4, 1 - seg.rank * 0.22)})`,
              }}
            >
              {seg.pct > 10 && (
                <span
                  className={`truncate px-1 font-mono text-[10px] ${
                    seg.isRest ? "text-paper/80" : "text-bg"
                  }`}
                >
                  {seg.label}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
