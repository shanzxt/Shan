import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import WeightSlider from "./WeightSlider";
import { EASE_OUT } from "../../lib/motion";

const CATEGORY_COLORS = [
  "var(--color-accent)",
  "#e0934a",
  "#c9ab6b",
  "#a89a7f",
  "#8fa08f",
  "var(--color-teal)",
];

export default function FundList({ funds, weights, onAdd, onRemove, onWeightChange }) {
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set(funds.map((f) => f.category));
    return [...set];
  }, [funds]);

  const colorForCategory = useMemo(() => {
    const map = new Map(categories.map((c, i) => [c, CATEGORY_COLORS[i % CATEGORY_COLORS.length]]));
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return funds;
    return funds.filter(
      (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [funds, query]);

  const selectedFunds = useMemo(
    () => [...weights.keys()].map((id) => funds.find((f) => f.id === id)).filter(Boolean),
    [weights, funds]
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13px] text-paper/60">
        Pick a few funds below, or tap a preset. Every number on the right
        updates as you go.
      </p>

      {selectedFunds.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border hr-line p-4">
          <span className="font-mono text-xs tracking-wide text-teal">
            selected ({selectedFunds.length})
          </span>
          <p className="text-[12px] text-paper/45">
            Drag to change how much of the portfolio goes into each fund.
            These always add up to 100% — dragging one down means the others
            take up the slack.
          </p>
          <AnimatePresence initial={false}>
            {selectedFunds.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="flex flex-col gap-1.5 overflow-hidden py-1.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-paper/85" title={f.name}>
                    {f.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(f.id)}
                    aria-label={`Remove ${f.name}`}
                    className="shrink-0 text-paper/30 transition-colors hover:text-accent"
                  >
                    <X size={14} />
                  </button>
                </div>
                <WeightSlider
                  fundId={f.id}
                  value={weights.get(f.id)}
                  allWeights={weights}
                  onChange={onWeightChange}
                  color={colorForCategory.get(f.category)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper/30"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by fund name or category…"
          className="w-full rounded-md border hr-line bg-transparent py-2 pl-9 pr-3 font-mono text-sm text-paper placeholder:text-paper/30 focus:border-accent/50 focus:outline-none"
        />
      </div>

      <div className="max-h-[420px] overflow-y-auto rounded-lg border hr-line">
        {categories
          .filter((cat) => filtered.some((f) => f.category === cat))
          .map((cat) => (
            <div key={cat}>
              <div
                className="sticky top-0 bg-bg px-3 py-1.5 font-mono text-[11px] tracking-wide"
                style={{ color: colorForCategory.get(cat) }}
              >
                {cat}
              </div>
              {filtered
                .filter((f) => f.category === cat)
                .map((f) => {
                  const isSelected = weights.has(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => (isSelected ? onRemove(f.id) : onAdd(f.id))}
                      className={`flex w-full items-center justify-between gap-3 border-t hr-line px-3 py-2 text-left text-sm transition-colors ${
                        isSelected ? "bg-accent/10 text-accent" : "text-paper/70 hover:bg-paper/5"
                      }`}
                    >
                      <span className="truncate">{f.name}</span>
                      {isSelected && <span className="shrink-0 text-xs">✓</span>}
                    </button>
                  );
                })}
            </div>
          ))}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-paper/30">No funds match "{query}".</p>
        )}
      </div>
    </div>
  );
}
