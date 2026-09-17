// Shared motion vocabulary for the intro animation, matching the main site's
// easing language (Hero.jsx's trace reveal) rather than Framer's defaults.
export const EASE_OUT = [0.16, 0.9, 0.2, 1];
export const EASE_IN_OUT = [0.65, 0, 0.35, 1];

// Slight overshoot on convergence moments (the mean collapsing the dots,
// numbers snapping into place) so they read as an arrival, not a stop.
export const SPRING_SNAP = { type: "spring", stiffness: 260, damping: 18, mass: 0.9 };
export const SPRING_SOFT = { type: "spring", stiffness: 90, damping: 16 };
