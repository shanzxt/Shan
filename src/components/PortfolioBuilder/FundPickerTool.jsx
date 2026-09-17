import { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
import DiversificationBars from "./DiversificationBars";

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

  // "Bridge back to the intro animation" tooltip, anchored to the
  // effective-N number — shown once, the first time a number appears
  // (whether via manual pick or preset), then stays dismissed for the
  // rest of the visit.
  const [introTooltipShown, setIntroTooltipShown] = useState(false);
  const [introTooltipDismissed, setIntroTooltipDismissed] = useState(false);
  const showIntroTooltip = introTooltipShown && !introTooltipDismissed;
  const dismissIntroTooltip = useCallback(() => setIntroTooltipDismissed(true), []);

  // Transient "that's a real jump" note after a preset click. Tracked via
  // a ref (not state) for the pending before-value so it survives the
  // setWeights -> recompute round trip without re-rendering twice.
  const [presetJump, setPresetJump] = useState(null);
  const pendingJumpFromRef = useRef(null);
  const jumpTimeoutRef = useRef(null);

  const clearPresetJump = useCallback(() => {
    pendingJumpFromRef.current = null;
    clearTimeout(jumpTimeoutRef.current);
    setPresetJump(null);
  }, []);

  useEffect(() => () => clearTimeout(jumpTimeoutRef.current), []);

  const selectedIds = useMemo(() => [...weights.keys()], [weights]);

  const addFund = useCallback((fundId) => {
    setWeights((prev) => {
      if (prev.has(fundId)) return prev;
      const next = new Map(prev);
      next.set(fundId, DEFAULT_RAW_WEIGHT);
      return next;
    });
    setHighlightPreset(null);
    clearPresetJump();
  }, [clearPresetJump]);

  const removeFund = useCallback((fundId) => {
    setWeights((prev) => {
      if (!prev.has(fundId)) return prev;
      const next = new Map(prev);
      next.delete(fundId);
      return next;
    });
    setHighlightPreset(null);
    clearPresetJump();
  }, [clearPresetJump]);

  const setWeight = useCallback((fundId, rawWeight) => {
    setWeights((prev) => {
      if (!prev.has(fundId)) return prev;
      const next = new Map(prev);
      next.set(fundId, rawWeight);
      return next;
    });
    clearPresetJump();
  }, [clearPresetJump]);

  const stats = useMemo(() => {
    if (weights.size === 0) return null;
    try {
      // A single selected fund has nothing to share a window with — the
      // "shared window" concept (and the universe-wide 22-month window it
      // produces, driven by the newest fund in the 44-fund set) doesn't
      // apply. Use that fund's own overlap window (= its own full
      // available history) instead of slicing into the precomputed
      // universe stats, so a lone fund's return/std/Sharpe reflect its
      // real history rather than an unrelated fund's recent inception.
      if (weights.size === 1) {
        const [singleId] = weights.keys();
        const ownWindow = getOverlapWindow([singleId], fundsData);
        return computePortfolioStats(weights, [singleId], ownWindow, fundsData);
      }
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

  // First time a real number appears on screen (manual pick or preset),
  // surface the one-time bridge-back-to-the-animation tooltip.
  useEffect(() => {
    if (stats && !introTooltipShown) {
      setIntroTooltipShown(true);
    }
  }, [stats, introTooltipShown]);

  const applyPreset = useCallback((preset) => {
    // If the intro tooltip is about to show (or already showing), don't
    // also fire the jump note on top of it — see the ordering rule in
    // the prompt. Otherwise capture the pre-click effective N so the
    // jump note can state a real "from ~X to ~Y" once stats recompute.
    const introWillOccupyTheSpot = !introTooltipShown || showIntroTooltip;
    pendingJumpFromRef.current = introWillOccupyTheSpot ? null : (stats ? stats.effective_n : null);
    clearTimeout(jumpTimeoutRef.current);
    setPresetJump(null);

    const next = new Map(preset.fundIds.map((id) => [id, DEFAULT_RAW_WEIGHT]));
    setWeights(next);
    setHighlightPreset(preset.label);
  }, [introTooltipShown, showIntroTooltip, stats]);

  // Resolve the pending jump note once new stats land from a preset click.
  useEffect(() => {
    if (pendingJumpFromRef.current === null || !stats) return;
    const from = pendingJumpFromRef.current;
    const to = stats.effective_n;
    pendingJumpFromRef.current = null;
    if (to > from) {
      setPresetJump({ from, to });
      clearTimeout(jumpTimeoutRef.current);
      jumpTimeoutRef.current = setTimeout(() => setPresetJump(null), 6000);
    }
  }, [stats]);

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

      <p className="max-w-md text-center text-[13px] text-teal">
        Try it: start all-equity, then add one low-correlation fund and watch
        what happens to the number on the right.
      </p>

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
              clearPresetJump();
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
                <StatsPanel
                  stats={stats}
                  highlightPreset={highlightPreset}
                  showIntroTooltip={showIntroTooltip}
                  onDismissIntroTooltip={dismissIntroTooltip}
                  presetJump={presetJump}
                />
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

          <DiversificationBars stats={stats} fundsById={FUNDS_BY_ID} />
        </div>
      </div>
    </div>
  );
}
