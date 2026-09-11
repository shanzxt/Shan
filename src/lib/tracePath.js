// Generates the hero trace: a signal that reads essentially flat, then
// bends sharply upward late in its path — echoing Day 25 -> 30 in the
// newsletter's compounding pond example. Deterministic (no Math.random)
// so the path is stable across renders.

export const TRACE_WIDTH = 1200
export const TRACE_HEIGHT = 520
const BASELINE_Y = 470
const PEAK_Y = 60
const BEND_START = 0.66 // fraction of width where the curve breaks upward
const POINTS = 160

function noise(i) {
  // small deterministic jitter so the flat section reads as a live signal,
  // not a ruled line
  return Math.sin(i * 12.9898) * 3.5 + Math.sin(i * 3.11) * 1.5
}

export function buildTracePath() {
  const points = []

  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS
    const x = t * TRACE_WIDTH

    let y
    if (t < BEND_START) {
      y = BASELINE_Y + noise(t)
    } else {
      // ease the bend in sharply (compounding, not linear) using a
      // cubic curve from the bend point to the peak
      const bendT = (t - BEND_START) / (1 - BEND_START)
      const eased = bendT * bendT * bendT
      y = BASELINE_Y + noise(BEND_START) - eased * (BASELINE_Y - PEAK_Y) + noise(t) * (1 - eased) * 0.6
    }

    points.push([x, y])
  }

  const d = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ")

  const end = points[points.length - 1]

  return { d, end: { x: end[0], y: end[1] } }
}
