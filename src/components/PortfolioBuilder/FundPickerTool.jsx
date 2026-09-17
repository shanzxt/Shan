import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import fundsData from "../../lib/portfolioEngine/funds_aligned.json";
import { getOverlapWindow } from "../../lib/portfolioEngine/overlap.js";
import {
  EXCLUDED_FUND_IDS,
  computeMeanVector,
  computeStdVector,
  computeCovarianceMatrix,
  computeCorrelationMatrix,
} from "../../lib/portfolioEngine/maths.js";
import { computePortfolioStats } from "../../lib/portfolioEngine/portfolioMath.js";
import { ALL_EQUITY_PRESET, EQUITY_PLUS_DEBT_PRESET } from "../../lib/portfolioEngine/presets.js";
import { EASE_OUT } from "../../lib/motion";
import FundList from "./FundList";
import CorrelationHeatmap from "./CorrelationHeatmap";
import StatsPanel from "./StatsPanel";

const UNIVERSE_FUND_IDS = fundsData.funds
  .map((f) => f.id)
  .filter((id) => !EXCLUDED_FUND_IDS.includes(id));

const UNIVERSE_WINDOW = getOverlapWindow(UNIVERSE_FUND_IDS, fundsData);

// Computed once, at module load — every fund add/remove/weight change
// downstream just slices into these full-universe Maps rather than
// recomputing a 44x44 covariance matrix on every interaction.
const UNIVERSE_MEANS = computeMeanVector(UNIVERSE_FUND_IDS, UNIVERSE_WINDOW, fundsData);
const UNIVERSE_STDS = computeStdVector(UNIVERSE_FUND_IDS, UNIVERSE_WINDOW, fundsData, UNIVERSE_MEANS);
const UNIVERSE_COV = computeCovarianceMatrix(UNIVERSE_FUND_IDS, UNIVERSE_WINDOW, fundsData, UNIVERSE_MEANS);
const UNIVERSE_CORR = computeCorrelationMatrix(
  UNIVERSE_FUND_IDS,
  UNIVERSE_WINDOW,
  fundsData,
  UNIVERSE_MEANS,
  UNIVERSE_STDS,
  UNIVERSE_COV
);

const FUNDS_BY_ID = new Map(fundsData.funds.map((f) => [f.id, f]));

const DEFAULT_RAW_WEIGHT = 1;

export default function FundPickerTool() {
  // Map<fundId, rawWeight> — Map throughout, per the engine's own
  // convention, so numeric-looking fund ids never silently reorder.
  const [weights, setWeights] = useState(() => new Map());
  const [highlightPreset, setHighlightPreset] = useState(null);

  const selectedIds = useMemo(() => [...weights.keys()], [weights]);

  const addFund = useCallback((fundId) => {
    setWeights((prev) => {
      if (prev.has(fundId)) return prev;
      const next = new Map(prev);
      next.set(fundId, DEFAULT_RAW_WEIGHT);
      return next;
    });
    setHighlightPreset(null);
  }, []);

  const removeFund = useCallback((fundId) => {
    setWeights((prev) => {
      if (!prev.has(fundId)) return prev;
      const next = new Map(prev);
      next.delete(fundId);
      return next;
    });
    setHighlightPreset(null);
  }, []);

  const setWeight = useCallback((fundId, rawWeight) => {
    setWeights((prev) => {
      if (!prev.has(fundId)) return prev;
      const next = new Map(prev);
      next.set(fundId, rawWeight);
      return next;
    });
  }, []);

  const applyPreset = useCallback((preset) => {
    const next = new Map(preset.fundIds.map((id) => [id, DEFAULT_RAW_WEIGHT]));
    setWeights(next);
    setHighlightPreset(preset.label);
  }, []);

  const stats = useMemo(() => {
    if (weights.size === 0) return null;
    try {
      return computePortfolioStats(
        weights,
        UNIVERSE_FUND_IDS,
        UNIVERSE_WINDOW,
        fundsData,
        UNIVERSE_MEANS,
        UNIVERSE_STDS,
        UNIVERSE_COV,
        UNIVERSE_CORR
      );
    } catch {
      // All-zero-weight case — normalizeWeights throws. Every slider at 0
      // is a valid (if useless) UI state, so just show nothing rather than
      // crash the tool.
      return null;
    }
  }, [weights]);

  return (
    <div className="w-full max-w-5xl flex flex-col gap-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="font-mono text-xs tracking-wide text-teal">
          now with real funds
        </span>
        <h2 className="max-w-2xl font-display text-2xl font-light text-paper sm:text-3xl">
          Build a portfolio from the 45-fund universe
        </h2>
        <p className="max-w-xl text-[15px] text-paper/60">
          Pick funds, set weights, and watch effective N — the same math from
          the animation above, running live on real NAV history.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 font-mono text-sm">
        <button
          type="button"
          onClick={() => applyPreset(ALL_EQUITY_PRESET)}
          className="rounded-md border hr-line px-4 py-2 text-paper/80 transition-colors hover:border-accent/50 hover:text-accent"
        >
          {ALL_EQUITY_PRESET.label}
        </button>
        <button
          type="button"
          onClick={() => applyPreset(EQUITY_PLUS_DEBT_PRESET)}
          className="rounded-md border hr-line px-4 py-2 text-paper/80 transition-colors hover:border-accent/50 hover:text-accent"
        >
          {EQUITY_PLUS_DEBT_PRESET.label}
        </button>
        {weights.size > 0 && (
          <button
            type="button"
            onClick={() => {
              setWeights(new Map());
              setHighlightPreset(null);
            }}
            className="rounded-md px-4 py-2 text-paper/40 transition-colors hover:text-paper/70"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <FundList
          funds={fundsData.funds.filter((f) => !EXCLUDED_FUND_IDS.includes(f.id))}
          weights={weights}
          onAdd={addFund}
          onRemove={removeFund}
          onWeightChange={setWeight}
        />

        <div className="flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {stats ? (
              <motion.div
                key={highlightPreset ?? "custom"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <StatsPanel stats={stats} highlightPreset={highlightPreset} />
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border hr-line px-4 py-6 text-center text-sm text-paper/40"
              >
                Select at least one fund with a nonzero weight to see stats.
              </motion.p>
            )}
          </AnimatePresence>

          <CorrelationHeatmap
            fundIds={selectedIds}
            fundsById={FUNDS_BY_ID}
            corr={UNIVERSE_CORR}
          />
        </div>
      </div>
    </div>
  );
}
