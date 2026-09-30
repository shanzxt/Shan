// Shared motion vocabulary (see DESIGN.md → Motion language).

// `sweep`: traces drawing, wipes, reveals.
export const EASE_OUT = [0.16, 0.9, 0.2, 1];
export const EASE_IN_OUT = [0.65, 0, 0.35, 1];

// `settle`: an underdamped second-order step response (ζ ≈ 0.5) — fast
// rise, one visible overshoot, settle. The site's arrival motion.
export const SETTLE = { type: "spring", stiffness: 170, damping: 13, mass: 1 };

// Existing names, kept for the portfolio tool's internal animations.
export const SPRING_SNAP = { type: "spring", stiffness: 260, damping: 18, mass: 0.9 };
export const SPRING_SOFT = { type: "spring", stiffness: 90, damping: 16 };

// Standard in-view reveal props for `motion.*` elements.
export function reveal(reduceMotion, { delay = 0, y = 18 } = {}) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0 },
    transition: { duration: 0.6, ease: EASE_OUT, delay: reduceMotion ? 0 : delay },
  };
}
