# DESIGN — SIGNAL / NOISE

> The market is a signal you learn to read. This site is the instrument you
> read it on.

## The concept

The whole site is **one calibrated measuring instrument**: a phosphor
oscilloscope bolted into a control-room panel. The owner builds control
systems and writes about money with the maths in the open, so the site
treats every page the same way an engineer treats a noisy sensor:

- **Everything starts as noise and resolves into signal when you give it
  attention.** The hero trace is jittery until it locks; charts draw
  themselves when they enter view; heatmap cells ripple in; numbers count
  up and *settle*.
- **Every section is a channel** (`CH-01`, `CH-02` …). Headings carry a
  channel tag; numbers carry units; labels read like engraved panel text.
- **Motion obeys control theory.** Arrivals are an *underdamped
  second-order response*: fast rise, one small overshoot, settle. That is
  literally the step response the owner tuned on a PID line-follower, and
  it's the site's single easing language.
- **Stillness is the noise floor.** Nothing loops forever except the one
  live trace (paused off-screen) and the data ticker (pauses on hover,
  static under reduced motion). When something moves, it's a reading.

### The signature interaction: the probe

On fine-pointer devices the cursor becomes an **oscilloscope probe**: full-
viewport crosshair hairlines with live X/Y readouts at the screen edges.
It changes state with context — `LOCK` (magnetic ring on buttons/links),
`READ` on newsletter cards, `PROBE` on interactive charts. In the hero,
the probe *filters the noise*: the trace near the cursor resolves into
the clean compounding curve. You literally pull the signal out of the
noise by pointing at it.

## Colour: "Phosphor"

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#07090a` | instrument black (faint green cast) |
| `--color-panel` | `#0e1213` | raised modules, rack panels |
| `--color-ink` | `#050606` | text on amber |
| `--color-paper` | `#ebe7dc` | readout white |
| `--color-accent` | `#ffb000` | CH1 amber phosphor — the one hot colour |
| `--color-teal` | `#5ad1c1` | CH2 cyan phosphor — secondary trace, labels |
| `--color-alarm` | `#ff5b3a` | alarms, 404, "noise" |
| `--color-line` | paper @ 11% | hairlines |
| `--color-grid` | amber @ 7% | graticule |

Amber stays the identity anchor (it was already the site's accent and
every chart series references the token). Teal became a real phosphor
cyan (the old `#4e7c7a` failed contrast as label text). Text never drops
below 60% paper on the dark base (Lighthouse flagged 45%).

No light theme: a phosphor instrument is dark by nature, and a half-good
light variant would dilute it.

## Type

- **Display — Anybody** (variable `wdth` 50–150, `wght` 100–900). The one
  expressive face. Its width axis is the kinetic instrument: giant type
  stretches with scroll velocity and settles back like a needle; on
  phones it runs condensed so huge type still fits 390px.
- **Readout — Martian Mono** (variable `wdth`, `wght`). Every label, unit,
  channel tag, number and UI control. Used small and condensed.
- **Reading — Newsreader** (variable `opsz`). Long-form issue text and
  body copy; the optical-size axis keeps it crisp at 17–19px and elegant
  at pull-quote sizes.

Scale (fluid, `clamp`): readout 11/12px · body 16–19px · h3 22–28px ·
h2 32–64px · display 64–220px. Tracking: display −0.02em to −0.04em,
readouts +0.06–0.14em uppercase.

## Motion language

| Name | Definition | Used for |
| --- | --- | --- |
| `settle` | spring, stiffness 170, damping 13 (ζ≈0.5, one overshoot) | arrivals, gauges, magnetic return |
| `sweep` | `cubic-bezier(.16,.9,.2,1)` 0.9–1.4s | traces drawing, wipes, reveals |
| `tick` | 120–180ms linear-ish | hover, focus, press |
| `read` | 450–600ms `sweep` | section reveals |

Rules:
1. Things move when they **arrive**, when the **user acts**, or when
   **data changes**. Otherwise still.
2. Only transform / opacity / clip-path / canvas. Never layout.
3. Nothing flashes more than 3×/s. No infinite loops except the live
   trace and ticker, both paused off-screen and static under reduced
   motion.
4. First paint is never hidden: above-the-fold text is visible in the
   prerendered HTML (animations there are additive — weight, width,
   scanlines — not opacity-from-zero). This is also what keeps LCP fast.
5. `prefers-reduced-motion` gets a designed alternative: static resolved
   trace, no probe, instant reveals, static ticker line, no preloader.

## The pieces

- **Boot sequence** — first visit per session, <2s, pure CSS in
  `index.html` (works before JS): graticule draws, noisy trace sweeps and
  locks, readout counts. Any key/click skips. Skipped entirely under
  reduced motion.
- **Hero** — canvas oscilloscope with phosphor persistence; the trace is
  the compounding curve buried in noise that locks after boot, filters
  under the probe, and re-noises with scroll velocity. Giant name in
  Anybody, per-letter weight response to the probe, width to scroll
  velocity.
- **Ticker tape** — real figures from the newsletter data (generated from
  `src/data/newsletter.js`, never typed by hand).
- **Home channels** — ProofStrip as a gauge rack; What I do as three
  asymmetric channel modules; the newsletter as a featured "screen";
  Work as a patch-bay spec list; footer as an XY Lissajous display you
  play with the cursor.
- **Route transitions** — View Transitions API: a scanline "channel
  switch" wipe, and newsletter card title → issue title shared-element
  morph. Plain navigation where unsupported.
- **Newsletters index** — a signal-timeline archive: a self-drawing trace
  spine with each issue as a large screen, cover art in phosphor duotone
  with parallax.
- **Issue pages** — editorial layout in Newsreader, giant outlined issue
  number, a strip-chart recorder as the scroll-progress motif, channel-
  style sticky TOC, charts that draw on entry.
- **Tools** — rack-mount control panel skin; an analog needle gauge for
  effective N that settles with the underdamped spring; heatmap cells
  ripple in. Engine untouched.
- **Easter eggs** — `/` or ⌘K/Ctrl+K opens a terminal command palette;
  the Konami code toggles CRT mode (scanlines + bloom); an optional sound
  layer (synthesised WebAudio ticks, OFF by default, header toggle).

## Dependencies

- **lenis** — smooth scrolling with native scroll semantics (anchors,
  sticky, `useScroll` all keep working); lazy-loaded, desktop fine-pointer
  only, never under reduced motion.
- No WebGL library: the phosphor trace is Canvas 2D. The hero's one-shot
  arrival field (`HeroField.jsx`) is raw WebGL, ~2 kB gzip, lazy, runs
  about 3 s once and stops; the CSS graticule is its fallback and rest state.
- **gsap** (+ ScrollTrigger) — only for scroll-scrubbed sequences, dynamically
  imported by the component that uses it (Day 29 replay, ~44 kB gzip, that
  page only). Lenis and GSAP share one frame loop (`lib/ticker.js`).
  Framer Motion remains the UI animation runtime. See `REFERENCES.md`.

## Result (measured, local `vite preview`, Lighthouse 12 mobile)

| Page | Before (perf / a11y / BP / SEO, LCP) | After |
| --- | --- | --- |
| `/` | 75 / 88 / 96 / 100, 4.5 s | 75 / 100 / 96 / 100, 4.4 s |
| `/newsletters/day-29` | 75 / 94 / 96 / 100, 4.5 s | 73 / 100 / 96 / 100, 4.8 s |
| `/portfolio` | — | 80 / 100 / 96 / 100, 4.0 s |

Initial JS (entry + modulepreloads, gzip): 133 kB → 145 kB. CSS gzip
7.5 kB → 12 kB. Web fonts: three variable faces, ~120 kB latin total
(Newsreader requested without `opsz`: 24 kB instead of 147 kB).

Budget rules that got perf back to baseline after the first build
dropped it to 67: the boot curtain animates only transform / clip-path
(no per-frame SVG `drop-shadow`, no `@property` counter); the hero
canvas starts only after boot + `requestIdleCallback` (the static SVG
curve is the first paint and LCP stays the text); phones draw at 30 fps.

## Cut, and why

- **Continuous WebGL / shader hero** — the trace stays Canvas 2D; WebGL is
  used only for the one-shot arrival field.
- **Pinned / horizontal-scroll sections** — only the Day 29 replay scrubs
  with scroll (it is a sticky panel inside a tall section, not scroll-jacking
  of the page); nothing else pins.
- **Light theme** — see Colour.
- **Per-page custom OG images** — the existing credential-free card
  stays; not a visual-overhaul item.
