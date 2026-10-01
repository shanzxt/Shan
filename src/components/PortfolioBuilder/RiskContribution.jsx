import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { normalizeWeights } from "../../lib/portfolioEngine/portfolioMath.js";
import { EASE_OUT } from "../../lib/motion";

// Where the risk actually comes from. Each fund's share of portfolio
// variance is its weight times its covariance with the whole portfolio,
// over total variance: RC_i = w_i (Σw)_i / wᵀΣw. Σ is the engine's own
// covariance matrix for the shared window, so these shares come straight
// from the real NAV data — nothing here is estimated or smoothed. A fund
// can hold 20% of the money and carry far more (or less) of the risk.
// Presentation only: the engine is untouched, this reads its outputs.

const shortName = (f) => f?.name.split(" - ")[0] ?? "";

export default function RiskContribution({ weights, cov, fundsById }) {
  const reduce = useReducedMotion();

  const rows = useMemo(() => {
    if (weights.size < 2) return null;
    let w;
    try {
      w = normalizeWeights(weights);
    } catch {
      return null;
    }
    const ids = [...w.keys()];
    const sigmaW = ids.map((a) => ids.reduce((sum, b) => sum + (cov.get(a)?.get(b) ?? 0) * w.get(b), 0));
    const total = ids.reduce((sum, a, i) => sum + w.get(a) * sigmaW[i], 0);
    if (!(total > 0)) return null;
    return ids
      .map((id, i) => ({ id, weight: w.get(id), risk: (w.get(id) * sigmaW[i]) / total }))
      .sort((a, b) => b.risk - a.risk);
  }, [weights, cov]);

  return (
    <div className="flex flex-col gap-3">
      <span className="readout text-teal">risk contribution</span>
      <p className="max-w-md text-[13px] text-paper/60">
        Share of the portfolio&apos;s variance each fund carries, from the same
        covariance matrix as the heatmap. Hairline = share of the money;
        amber bar = share of the risk.
      </p>

      {rows ? (
        <div className="panel p-4 sm:p-5">
          <div aria-hidden="true" className="flex items-baseline gap-3 border-b border-paper/25 pb-2">
            <span className="engraved flex-1 text-paper/60">Fund</span>
            <span className="engraved w-14 text-right text-paper/60">Weight</span>
            <span className="engraved w-14 text-right text-paper/60">Risk</span>
          </div>
          <ul>
            {rows.map((r, i) => (
              <li key={r.id} className="border-b border-line py-2.5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tabular-nums text-paper/60">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 truncate text-[14px] text-paper/85">{shortName(fundsById.get(r.id))}</span>
                  <span aria-hidden="true" className="leader" />
                  <span className="w-14 text-right font-mono text-[12px] tabular-nums text-paper/65">
                    {(r.weight * 100).toFixed(1)}%
                  </span>
                  <span className="w-14 text-right font-mono text-[13px] font-medium tabular-nums text-accent">
                    {(r.risk * 100).toFixed(1)}%
                  </span>
                </div>
                {/* transform-only: the bar scales, the weight tick slides */}
                <div aria-hidden="true" className="relative mt-1.5 h-1.5 bg-paper/[0.06]">
                  <motion.span
                    className="absolute inset-0 origin-left bg-accent/80"
                    initial={false}
                    animate={{ scaleX: Math.min(Math.max(r.risk, 0), 1) }}
                    transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE_OUT }}
                  />
                  <motion.span
                    className="absolute inset-0"
                    initial={false}
                    animate={{ x: `${r.weight * 100}%` }}
                    transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE_OUT }}
                  >
                    <span className="absolute -top-0.5 left-0 h-2.5 w-px bg-paper" />
                  </motion.span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="panel px-4 py-6 text-center text-sm text-paper/60">
          Select at least two funds with nonzero weights to see where the risk sits.
        </div>
      )}
    </div>
  );
}
