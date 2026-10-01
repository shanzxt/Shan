// One frame loop for everything scroll-driven. Lenis subscribes here; when
// a page lazy-loads GSAP for a scrubbed sequence, the loop hands over to
// gsap.ticker so smooth scroll and ScrollTrigger read the same frame
// (no one-frame lag between the scroll position and the scrubbed value).

const subscribers = new Set()
let raf = 0
let gsapDriven = false

function loop(time) {
  subscribers.forEach((fn) => fn(time))
  raf = requestAnimationFrame(loop)
}

export function onFrame(fn) {
  subscribers.add(fn)
  if (!gsapDriven && !raf) raf = requestAnimationFrame(loop)
  return () => {
    subscribers.delete(fn)
    if (!subscribers.size && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}

export function driveWithGsap(gsap) {
  if (gsapDriven) return
  gsapDriven = true
  cancelAnimationFrame(raf)
  raf = 0
  gsap.ticker.add((seconds) => subscribers.forEach((fn) => fn(seconds * 1000)))
  gsap.ticker.lagSmoothing(0)
}
