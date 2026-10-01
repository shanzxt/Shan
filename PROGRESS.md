# PROGRESS: feature/next-level

Resume here. See ROADMAP.md for the ranked item list and definitions of done.
Branch: `feature/next-level` (from `staging`). Nothing pushed; commit locally only.

## Done
- Phase 0 audit + ROADMAP.md
- Item 1 prerender + SEO: `src/entry-server.jsx` + `scripts/prerender.mjs` (React 19 `react-dom/static`, no new deps) write
  `dist/<route>/index.html` for `/`, `/newsletters`, each issue, `/portfolio`, plus `404.html`, `sitemap.xml`, `robots.txt`,
  `feed.xml`. Head tags from `src/lib/seo.js` (`routeMeta`); `RouteEffects` in App.jsx re-applies them on client nav and
  resets scroll. `vercel.json` (cleanUrls, immutable `/assets`). `public/og-default.png` (credential-free card, rendered
  from a scratch HTML via headless Chrome). 404 route + `NotFound` page added (part of item 3).

- Item 2 performance: Recharts split into lazy `IssueChart.jsx` (only loaded for issues with `chart`); WebP siblings via
  `scripts/make-webp.py` served through `<picture>` (PNG kept for lightbox/fallback), `decoding=async`; Google Fonts
  stylesheet now non-blocking (preload + media=print swap + noscript). `src/data/newsletter.test.js` guards image
  files/webp/width/height/alt (it caught 4 images missing dimensions, filled from real PNG sizes).
  Bundles gzip before -> after: article body chunk 112.3 kB (`IssueContent`, carried Recharts) -> 3.1 kB
  (`NewsletterIssue`) + 102.7 kB `IssueChart` only on issues with a chart; main `index` 92.3 -> 92.4; `motion` 43.8 -> 42.5.
  Chart images: PNG 90-380 kB -> WebP 45-170 kB.
- Item 3: `chrome/ErrorBoundary.jsx` wraps `<Routes>`, keyed by pathname (navigation resets it); fallback offers
  reload (covers stale lazy chunks after a redeploy). 404 page + `dist/404.html` already done in item 1.
- Item 4 reading experience: `h2` blocks get stable ids (`src/lib/headings.js`, tested for uniqueness); `IssueToc.jsx`
  sticky left rail at xl+, collapsible `<details>` below xl; `ShareButton.jsx` (navigator.share, else clipboard copy);
  `@media print` in index.css + `print:hidden` on header/grain/lightbox/tool panels/nav links. No separate progress bar:
  Header already renders a scroll-progress hairline site-wide. Verified at 390 and 1440 (no horizontal overflow).
- Item 5 tools hub: `src/pages/Tools.jsx` at `/tools` driven by existing `src/data/tools.js` (links tool + its issue);
  in prerender/sitemap. `ToolDisclaimer.jsx` ("Educational, not investment advice. Fund names are examples from the
  dataset, not recommendations.") on /tools, /portfolio under the fund picker, and in-issue tool panels.
- Item 6 correctness: `npm test` = 17 node:test unit tests (engine maths, newsletter images, heading ids);
  `npm run test:routes` builds dist-ssr and server-renders every route with `onError` collection (`render(url, options)`
  in entry-server.jsx), asserting an h1, no 404/error fallback, and 404 for unknown routes/slugs. It caught /portfolio
  having no h1 -> added an sr-only `<h1>Portfolio tool</h1>` (no visual change).
- Item 7 design polish: below `sm` the header nav is a Menu button + solid dropdown (aria-expanded/controls, Escape,
  closes on any navigation via location-keyed state); desktop nav unchanged. Skip-to-content link + `<main id="main">`
  in App.jsx. Footer (amber surface) gets an ink focus ring. Fund search input focus border full accent. Masthead and
  card charts: `left: 0` margin so y-axis ₹ labels aren't clipped. Global `:focus-visible` ring and reduced-motion CSS
  already existed. Verified 390 (menu open) and 1440.
- Item 8 analytics: `@vercel/analytics` `<Analytics />` in App.jsx (+~1 kB gzip on main chunk). Inert until enabled
  in the Vercel dashboard (see manual steps).
- Item 9 repo hygiene: README rewritten (setup, scripts, routes, adding an issue/tool, deploy pointer);
  `.github/workflows/ci.yml` (lint, test, build, route smoke on PRs + pushes to staging/main); `.env*` ignored.

**Roadmap complete.** Final gzip sizes: main `index` 92.3 -> 94.3 kB (+analytics, mobile menu, error boundary);
issue body chunk 112.3 -> 4.1 kB, Recharts (102.7 kB) only fetched for issues with a masthead chart.

## In progress
- (none)

## Next
- Nothing on the roadmap. Candidates for a later pass: Lighthouse run on the staging preview (CLI not installed here);
  LazyMotion (~15 kB); self-hosting fonts; move Footer out of `<main>`; CLAUDE.md still describes `IssueModal.jsx`
  and shantanusomwanshi.com and could be refreshed.

## Decisions
- Site URL for canonical/sitemap/feed: `https://www.shantests.in` (live domain per user; README/CLAUDE.md still say shantanusomwanshi.com).
- Kept `node:test` instead of adding vitest: 14 engine tests already exist and pass.
- Home keeps index.html's existing description tag; og/twitter description on home uses the credential-free `DEFAULT_DESCRIPTION` in seo.js.
- Unknown issue slugs now render the 404 page instead of redirecting to /newsletters.
- Newsletter issues stay in `src/data/newsletter.js` (no MDX migration).
- Existing credential wording in Hero/WhatIDo/index.html description left untouched (user rule: leave existing copy). No new meta/JSON-LD/OG text repeats it.

- Header nav: "Portfolio tool" replaced by "Tools" (-> /tools) to keep 5 items; /portfolio stays reachable from the
  hub, ProofStrip and Footer.
- New disclaimer wording is mine (none existed); kept to one plain sentence pair.

## Gotchas
- `vite preview` always serves the SPA fallback `index.html`, not the per-route prerendered files — check `dist/` directly
  (or on Vercel) to verify prerendered HTML.
- Client uses `createRoot` (not `hydrateRoot`) on purpose: `useReducedMotion()` is null on the server, so hydrating would
  mismatch for reduced-motion users. Static HTML is for crawlers/first paint; React re-renders over it.
- `seo.js` imports the full newsletter data — only `import()` it on the client, never statically from app code.
- Lighthouse CLI not installed; skipped.
- Live site deep links (`/newsletters/day-29`) return 404 on hard load: no SPA fallback configured on Vercel.

- Chrome extension (claude-in-chrome) was not connected this session. Visual checks use `node scripts/screenshot.mjs
  <url> <width> <out.png> [scrollY]` against `npx vite preview --port 4173`; it prints innerWidth/scrollWidth and any
  element overflowing the viewport.
- Footer (`<footer id="contact">`) now sits inside `<main>` because it's rendered by Home; left as is to avoid
  restructuring the landing page.
- PROGRESS.md was cp1252 + CRLF at one point; it is now UTF-8. Edit it as UTF-8.

## Manual / dashboard steps for the user
- Enable analytics: vercel.com -> the site's project -> **Analytics** tab -> **Enable** (Web Analytics). Takes effect on
  the next deployment; no cookies, no banner needed.

---

# Creative overhaul (branch `feature/creative-overhaul`, cut from `staging` at `db5df72`)

Concept + tokens + motion rules: **DESIGN.md** (SIGNAL / NOISE — the site as one phosphor oscilloscope / control
panel). Nothing pushed. Content (copy, numbers, links) must stay word-for-word; only presentation changes.

## Done
- Phase 1: DESIGN.md.
- Foundation: `@theme` tokens (Phosphor palette, Anybody / Martian Mono / Newsreader, `ease-sweep|settle|switch`,
  `readout` / `panel` / `graticule` / `glow` utilities), CSS-only boot sequence in `index.html` (session-once, skippable,
  off under reduced motion), `lib/env.js` (SSR-safe capability checks), `lib/settings.js` (probe / sound / crt toggles),
  `lib/firstLoad.js` (first prerendered route never animates in; tracked by location key during App render),
  `lib/transition.js` + `chrome/TransitionLink.jsx` (View Transitions navigation + chunk preload on hover),
  `lib/routeChunks.js`, `lib/scroll.js` (Lenis-aware), `lib/sfx.js` + `lib/sound.js` (WebAudio, off by default).
- Shell: new Header (channel nav, IST clock, sound toggle, ⌘K button, full-screen mobile channel selector),
  `chrome/Effects.jsx` (Lenis, probe cursor, palette hotkeys, Konami → CRT mode, toast), `chrome/ProbeCursor.jsx`,
  `chrome/CommandPalette.jsx`, `chrome/RouteFallback.jsx`.
- Hero: canvas oscilloscope (`lib/signal.js`), probe filters noise, letter lens on the name, static SVG for SSR /
  reduced motion. `DataTicker.jsx` (figures generated from newsletter data).

- Home sections: ProofStrip gauge rack (tick meters, M-01..04), WhatIDo channel bento with self-drawing schematics +
  underdamped step-response plot, Newsletter + IssueCard featured "screen" (`SignalChart` phosphor Recharts that
  mounts/draws in view), Work patch-bay list, Footer XY-mode Lissajous (`Lissajous.jsx`) + amber email tape band.
  Shared: `SectionHeader.jsx` (CH-0X strip), `SplitHeading.jsx` (word reveal + wdth settle), `Magnetic.jsx`.
  Verified 1440 + 390 at every scroll depth.

- Newsletters index: signal-timeline archive (scroll-drawn spine, parallax cover screens, outlined issue numerals,
  title `view-transition-name` morph into the issue h1).
- Issue page: editorial masthead, § numbered section heads, drop cap, figure "screens" with Fig. numbers, pull quotes,
  `ReadingRecorder.jsx` strip-chart progress (sections ticked at real positions), channel TOC rail (xl) / details
  (below xl), `SignalChart` masthead that draws in view, restyled lightbox, prev/next panels.
- Tools: `/portfolio` rack-mount frames, `EffectiveNGauge.jsx` needle (settle spring), heatmap cell ripple
  (`.heat-cell`), preset toggle switches with LEDs, contrast bump on all tool text (presentation classes only —
  engine untouched, 17/17 tests pass). `/tools` hub with pixel-ripple preview. UnderTheHood bento.
- 404 "NO SIGNAL" test pattern + `Flatline.jsx`; error-boundary screen restyled.
- Verified: palette (/ and ⌘K) → navigate via View Transition, Konami → CRT on/off, mobile menu focus + Escape,
  reduced-motion render (no boot, no canvas, no probe, static SVG curve), no console errors.
- Perf pass (see DESIGN.md → Result). Lighthouse a11y 100 on every page measured.

## In progress
- (none) — overhaul complete.

## Next (optional)
- Issue page CLS 0.03 (masthead chart Suspense fallback height vs real chart) — could reserve exact height.
- Self-host the three variable fonts to cut the Google Fonts round-trip on mobile LCP.
- Real-device check of the hero canvas at 30 fps on a mid-range Android.

## Decisions
- Canvas 2D instead of WebGL (see DESIGN.md → Dependencies). Only new dep: `lenis`.
- Newsreader requested without the `opsz` axis: 24 kB vs 147 kB latin.
- Hero letter lens changes letter widths (layout) — deliberate exception to "transform only", scoped with
  `contain: layout` on the h1, desktop fine pointer only.

- Old dark teal `#4e7c7a` kept only inside the correlation heatmap (its caption says "dark teal"); site token is
  the brighter `#5ad1c1`.
- CRT mode uses `backdrop-filter` on an overlay, not `filter` on #root (filter makes #root the containing block for
  every `position: fixed` child and broke the header).
- The 404/boot/hero never hide prerendered text; entrance animations only run after a client-side navigation
  (`isInitialLoad()`).

## Gotchas
- `html.boot { overflow: hidden }` beat `overflow-x: clip` on html; the real fix for the 417px mobile layout
  viewport was `main { overflow-x: clip }` (kinetic headings start 125% wide) — check `innerWidth` at 390, not just
  scrollWidth.
- `font-variation-settings` with a CSS `var()` inside computed as invalid → fell back to regular weight. Use
  `font-weight` / `font-stretch` (registered axes) instead.
- Inline-block letter spans kill kerning ("SHANT ANU"); use plain inline spans.
- Baseline (local `vite preview`, Lighthouse 12 mobile): home perf 75 / a11y 88 / BP 96 / SEO 100, LCP 4.5 s;
  issue page 75 / 94 / 96 / 100. Baseline gzip: main `index` 94.3 kB, CSS 7.5 kB. Lighthouse via
  `npx -y lighthouse@12` with `CHROME_PATH` set (not a project dependency).
- Word/line reveals must be driven by the *parent* heading's whileInView (variants): a child span that starts fully
  masked inside `overflow-hidden` is clipped out of IntersectionObserver's view and may never fire. KineticHeading
  and SplitHeading both work this way now.
- Bundle size: compare *total initial JS* (entry + modulepreloaded chunks from dist/index.html), not just `index-*.js`
  — chunking moved framer-motion into the entry. Baseline total 133 kB gzip; after home rebuild 144 kB.
- Git Bash `ln -s` on a directory copies it; don't symlink node_modules into worktrees.
- Screenshot helper now supports `MOUSE="x,y;x,y"` for hover states.

---

# Instrument upgrade (branch `feature/instrument-upgrade`, cut from `staging` `2137334`)

- Hero: `HeroField.jsx` one-shot WebGL arrival (noise → graticule under an amber crest on the `switch` curve, underdamped ring-down), lazy, stops when settled, nothing on reduced motion.
- Day 29: `CompoundingScrub.jsx` replays the flat SIP series with GSAP ScrollTrigger (lazy) + Lenis on one ticker (`lib/ticker.js`). Readouts snap to the issue's own 5-year marks (no interpolated figures); invested is the issue's ₹42.1L pro-rated by years (flat SIP accrues linearly). Data flag: `replay: "flat"` on the issue.
- `SettleReadout.jsx`: value changes drop in on the `settle` spring; first render static. Used in replay, StatsPanel, heatmap hover, eigen strip.
- Portfolio: heatmap cells slide/re-colour on update (`attrX/attrY` — framer treats SVG `x/y` as transforms), accent outline on the hovered cell, `EigenSpectrum.jsx`, `.keycap` preset keys.
- `Dialog.jsx` + `lib/useModal.js` (focus trap, Esc, scroll lock, focus return); issue lightbox uses it.
- Audit: readable text raised to ≥ /60, `rounded-md/lg` removed from tool stages, arrow hover no longer scales.
- Bundle (gzip): initial JS 146.1 → 146.3 kB; lazy HeroField 2 kB; gsap + ScrollTrigger 43.6 kB on the Day 29 page only.
- Not done: Taste Skill install and the 21st.dev / ThreeUI MCPs (install blocked by permission prompt / needs API key / paid). Lighthouse not re-run.

## Gotchas
- ScrollTrigger measures once; lazy content above it (Recharts, images) shifts the page, so `CompoundingScrub` refreshes on a body ResizeObserver.
- `sweep` ease front-loads ~80% of travel; for something that should be watched crossing the screen use `switch`.

## Session: elegance pass (2026-10-01, `feature/elegance-pass`)
- Direction + relaxed rules: `DESIGN.md` → Direction. CLAUDE.md updated to match.
- Type/grid: `body` tabular-nums; `engraved`, `leader`, `ledger-row`, `vignette` utilities; `chrome/ColumnRules.jsx` (12-col hairlines + vignette, lg only); `SectionHeader` is a statement line item.
- Hero: real Day 29 flat-SIP samples (`data/sipScenarios.js`, `lib/series.js` monotone cubic) are the curve; masthead name; ₹4.72Cr key figure is the one glow; crosshair snaps to sampled years. `HeroField` now persists (parallax grids, grain, glow at the figure) and renders on demand; desktop only.
- `Crosshair.jsx`: hero, issue chart (replaces the Recharts tooltip), correlation heatmap. Probe cursor hides on `data-cursor="measure"`.
- Filings index (`NewslettersIndex`): number / filed / issue / headline figure / sparkline. 44-fund spark = engine eigen spectrum (85.21%…), guarded by `newsletter.test.js`. New issue fields: `headline`, `spark`.
- Issue page: filing header row, bigger title, stats as a right-aligned statement.
- Portfolio: visible masthead; heatmap full width up to 640px with crosshair + row/col focus + resolve keyframes; `RiskContribution.jsx` (w_i(Σw)_i / wᵀΣw from `UNIVERSE_COV`).
- Home newsletter: `Chapters.jsx` pinned page-turn (sticky + GSAP scrub, desktop). `IssueCard.jsx` removed.
- `Amount.jsx`: ₹ raised in mono (font payload, see DESIGN.md Result).
- Bundle: initial JS gzip 146.3 → 148.0 kB. Lighthouse `/` mobile 75–76 perf, 100 a11y.

## Gotchas (elegance pass)
- A CSS animation with `fill-mode: both` holds `opacity`, so the SVG `opacity` attribute is ignored afterwards. Dim heatmap cells with `fillOpacity`.
- framer `pathLength` dashes break with `vectorEffect="non-scaling-stroke"`.
- Lighthouse on this machine varies ±10 between runs. Compare against a staging build served on another port (`git worktree add`), not against old numbers.
