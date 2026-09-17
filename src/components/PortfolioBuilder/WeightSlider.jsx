import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 120;

// Local value updates instantly (so the thumb feels responsive); the
// commit to parent state — which triggers a portfolio-stats recompute —
// is debounced so dragging doesn't fire a recompute on every mousemove.
export default function WeightSlider({ fundId, value, onChange, color }) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  function handleInput(e) {
    const next = Number(e.target.value);
    setLocalValue(next);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(fundId, next);
    }, DEBOUNCE_MS);
  }

  function handleCommit(e) {
    clearTimeout(timeoutRef.current);
    onChange(fundId, Number(e.target.value));
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={0}
        max={5}
        step={0.1}
        value={localValue}
        onChange={handleInput}
        onMouseUp={handleCommit}
        onTouchEnd={handleCommit}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-paper/15 accent-accent"
        style={{ accentColor: color ?? "var(--color-accent)" }}
      />
      <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-paper/50">
        {localValue.toFixed(1)}
      </span>
    </div>
  );
}
