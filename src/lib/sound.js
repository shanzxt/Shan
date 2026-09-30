// Optional sound layer (OFF by default, header / palette toggle). Every
// sound is synthesised with WebAudio — no audio files to download.
export function createSound() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return { play() {} }
  const ctx = new AudioCtx()
  const master = ctx.createGain()
  master.gain.value = 0.05
  master.connect(ctx.destination)

  function blip(freq, duration, { type = "sine", at = 0, gain = 1, slide } = {}) {
    const t = ctx.currentTime + at
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + duration)
    env.gain.setValueAtTime(0.0001, t)
    env.gain.exponentialRampToValueAtTime(gain, t + 0.004)
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(env).connect(master)
    osc.start(t)
    osc.stop(t + duration + 0.02)
  }

  const sounds = {
    tick: () => blip(2600, 0.02, { type: "square", gain: 0.18 }),
    lock: () => {
      blip(880, 0.05)
      blip(1320, 0.08, { at: 0.05 })
    },
    switch: () => blip(420, 0.12, { type: "triangle", slide: 1400, gain: 0.5 }),
    on: () => {
      blip(660, 0.07)
      blip(990, 0.07, { at: 0.07 })
      blip(1320, 0.12, { at: 0.14 })
    },
  }

  let lastTick = 0
  return {
    play(name) {
      if (ctx.state === "suspended") ctx.resume()
      if (name === "tick") {
        const now = performance.now()
        if (now - lastTick < 60) return
        lastTick = now
      }
      sounds[name]?.()
    },
  }
}
