import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

function formatPercent(x, decimals = 2) {
  return `${(x * 100).toFixed(decimals)}%`;
}

function ConfidenceNote({ detail }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Confidence note"
        className="text-paper/30 transition-colors hover:text-teal"
      >
        <Info size={12} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-md border hr-line bg-bg p-3 text-left text-xs leading-snug text-paper/70 shadow-lg"
          >
            {detail}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StatsPanel({ stats, highlightPreset }) {
  const flagList = [...stats.confidence_flags.entries()];

  return (
    <div className="flex flex-col gap-6 rounded-lg border hr-line p-5">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-mono text-xs tracking-wide text-teal">effective number of bets</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={stats.effective_n.toFixed(3)}
            initial={{ opacity: 0, scale: 0.75, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="font-mono text-5xl text-accent tabular-nums"
          >
            {stats.effective_n.toFixed(2)}
          </motion.span>
        </AnimatePresence>
        <span className="text-xs text-paper/40">
          out of {stats.n_funds_selected} fund{stats.n_funds_selected === 1 ? "" : "s"} selected
        </span>
        {highlightPreset && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, ease: EASE_OUT }}
            className="mt-1 rounded-full border hr-line px-3 py-1 text-[11px] text-teal"
          >
            {highlightPreset}
          </motion.span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 font-mono text-sm tabular-nums">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-paper/45">annualized return</span>
          <span className="text-paper">{formatPercent(stats.annual_return_display)}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-paper/45">annualized std dev</span>
          <span className="text-paper">{formatPercent(stats.annual_std)}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-paper/45">Sharpe ratio</span>
          <span className="text-paper">
            {stats.sharpe_ratio === null ? "—" : stats.sharpe_ratio.toFixed(2)}
          </span>
        </div>
      </div>

      {(stats.portfolio_window_note || flagList.length > 0) && (
        <div className="flex flex-col gap-2 border-t hr-line pt-4">
          {stats.portfolio_window_note && (
            <div className="flex items-start gap-2 text-xs text-paper/50">
              <ConfidenceNote detail={stats.portfolio_window_note.detail} />
              <span>Shared window is shorter than usual for this selection.</span>
            </div>
          )}
          {flagList.map(([fid, flags]) =>
            flags.map((flag, i) => (
              <div key={`${fid}-${i}`} className="flex items-start gap-2 text-xs text-paper/50">
                <ConfidenceNote detail={flag.detail} />
                <span>
                  {flag.reason === "intrinsically_short_history"
                    ? `Fund ${fid} has limited own history.`
                    : `Fund ${fid}'s correlations may be noisy (low variance).`}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
