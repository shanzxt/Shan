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

// The same curves as plain functions of progress, for code that eases by
// hand (GSAP timelines, shaders): a CSS-style cubic-bezier solved for y at
// x by bisection.
export function bezierEase([x1, y1, x2, y2]) {
  const bx = (t) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const by = (t) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  return (x) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (bx(mid) < x) lo = mid;
      else hi = mid;
    }
    return by((lo + hi) / 2);
  };
}
