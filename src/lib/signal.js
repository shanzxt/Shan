// The hero's signal model (DESIGN.md → Hero). Pure and deterministic.
//
// The clean signal is a compounding curve: flat for most of its length,
// then bending sharply up — the newsletter's Day 25 → Day 30 pond, drawn
// as a real exponential rather than a hand-tuned bend.
const K = 6.4
const E_K = Math.exp(K) - 1

export function compounding(t) {
  return (Math.exp(K * t) - 1) / E_K
}

// Cheap hash → [0, 1). Deterministic per (sample, frame) so the noise
// looks like scope static, not a smooth wobble.
function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

// Noise at sample `i` on frame `frame`, roughly in [-1, 1]: fast static
// plus a slow drift so the band has some shape.
export function noise(i, frame, time) {
  return (hash(i * 1.618 + frame * 0.731) * 2 - 1) * 0.7 + Math.sin(i * 0.19 + time * 1.7) * 0.3
}

// How much of the noise survives at horizontal position x when the probe
// sits at px (both 0..1): the probe filters a gaussian window around it.
export function probeFilter(x, px, width = 0.09) {
  if (px == null) return 1
  const d = (x - px) / width
  return 1 - 0.94 * Math.exp(-d * d)
}

// SVG path of the clean signal, for the reduced-motion / no-JS render.
export function signalPath(w, h, top, bottom, points = 120) {
  let d = ""
  for (let i = 0; i <= points; i++) {
    const t = i / points
    const x = t * w
    const y = bottom - compounding(t) * (bottom - top)
    d += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`
  }
  return d
}
