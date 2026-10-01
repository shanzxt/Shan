import { motion, useReducedMotion } from "framer-motion";
import { SETTLE } from "../../lib/motion";
import SettleReadout from "../SettleReadout";

// The eigenvalues of the selected funds' correlation matrix, drawn as a
// spectrum-analyser strip: one bar per independent direction, height =
// that eigenvalue's share of the total (they sum to n). Same numbers the
// effective-N calculation uses; nothing here is computed separately.
// Bars are keyed by rank so adding or removing a fund re-flows the strip
// with a layout transition and each bar settles to its new height.
export default function EigenSpectrum({ stats }) {
  const reduce = useReducedMotion();
  const values = stats?.eigenvalues ?? [];
  if (values.length < 2) return null;

  const total = values.reduce((sum, v) => sum + v, 0);
  const shares = [...values].sort((a, b) => b - a).map((v) => Math.max(v, 0) / total);

  return (
    <div className="flex flex-col gap-3">
      <span className="readout text-teal">eigenvalue spectrum</span>
      <div className="panel graticule relative p-4">
        <div className="flex items-baseline justify-between gap-4 font-mono text-[12px] text-paper/60">
          <span>
            λ1 share{" "}
            <SettleReadout value={`${(shares[0] * 100).toFixed(1)}%`} className="text-accent" />
          </span>
          <span>
            n <SettleReadout value={String(values.length)} className="text-paper" />
          </span>
        </div>
        <div className="mt-3 flex h-28 items-end gap-[3px]" aria-hidden="true">
          {shares.map((share, i) => (
            <motion.div
              key={i}
              layout={!reduce}
              transition={SETTLE}
              className="relative h-full min-w-0 flex-1"
            >
              <motion.div
                initial={false}
                animate={{ scaleY: Math.max(share, 0.004) }}
                transition={reduce ? { duration: 0 } : SETTLE}
                className={`absolute inset-x-0 bottom-0 h-full origin-bottom ${
                  i === 0 ? "bg-accent shadow-phosphor" : "bg-accent/35"
                }`}
              />
            </motion.div>
          ))}
        </div>
        <p className="sr-only">
          Largest eigenvalue carries {(shares[0] * 100).toFixed(1)}% of the total across {values.length} funds.
        </p>
      </div>
    </div>
  );
}
