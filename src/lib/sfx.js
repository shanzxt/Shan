// Facade for the optional sound layer. Components call `sfx("tick")`
// freely; it is a no-op until the user switches sound on, at which point
// the synth (lib/sound.js) is loaded on demand.
let engine = null

export function setSoundEngine(next) {
  engine = next
}

export function sfx(name) {
  engine?.play(name)
}
