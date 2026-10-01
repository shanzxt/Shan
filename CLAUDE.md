# shantests.in — project rules

Personal site for Shantanu Somwanshi: instrumentation engineer who writes a
personal finance / investing newsletter (shantanusomwanshi.substack.com)
and ships interactive tools built from it. Live at https://www.shantests.in.

Stack: Vite 8 + React 19 + Tailwind CSS v4 + Framer Motion + Recharts +
lucide-react + Lenis. No backend, no CMS. Every route is prerendered to
static HTML at build time and deployed on Vercel. The full design
rationale lives in `DESIGN.md`; session history and gotchas in
`PROGRESS.md`. This file is the rulebook — follow it exactly.

---

## 1. Working with the owner

- **The owner is new to React and JavaScript.** When they build a
  feature themselves, or ask how something works, explain step by step:
  which file to open, what to add and where (show the exact snippet),
  why it works, and how to check it in the browser (`npm run dev` →
  http://localhost:5173). Name the concept being used (prop, state,
  hook, import) in plain words the first time it appears. Don't skip
  steps or assume prior JS knowledge; don't dump a whole file when a
  small snippet will do.
- When doing the work yourself, keep the chat short and put details in
  commits / `PROGRESS.md`.

## 2. Deployment workflow (HARD RULE, every session)

Two deploy targets on Vercel:

- `staging` branch → Vercel preview / testing URL (safe to push)
- `main` branch → LIVE production site (protected)

Trigger phrases, and only these:

1. **"push"** ("push it", "push this", "push changes", "push to staging")
   → commit pending work, merge the current feature branch into
   `staging`, push **only** `staging`. Never push `main` for this
   phrase. Then give the testing link: check
   `gh api repos/shanzxt/Shan/commits/<sha>/status` for the Vercel
   status `target_url`; otherwise tell the owner to open the Vercel
   dashboard's Deployments tab. Wait for them to verify.
2. **"push to main site"** ("push main", "push production", "go live")
   → make sure `staging` is pushed and clean, then
   `git checkout main && git pull && git merge --ff-only staging` and
   push `main` with `ALLOW_MAIN_PUSH=1`. If fast-forward fails, open a
   PR `staging` → `main` with `gh` instead; if `gh` is unavailable,
   stop and say so. If wording is ambiguous ("deploy it", "ship it",
   "push to main", "publish"), **ask which one is meant** before acting.
3. **Never**, without explicit instruction in the current message: push
   `main`, run `vercel --prod` or promote a deployment, force-push
   `main` or `staging`, or change Vercel production branch/domain
   settings.

Local safety hook: `.git/hooks/pre-push` blocks pushes to `main` unless
`ALLOW_MAIN_PUSH=1` is set — only set it in the flow above. If
`git branch --show-current` is unexpected, or the owner is on `main`
when they say "push", stop and tell them first.

New work goes on a `feature/<name>` branch cut from `staging`. Commit
locally in small steps; only push on the trigger phrases.

## 3. Content and tone (non-negotiable)

- **Every number is real**, from the newsletter's Python analysis, the
  live Substack post, or `src/lib/portfolioEngine/funds_aligned.json`.
  Never invent figures, quotes or body copy — ask, or leave a clearly
  marked placeholder.
- **Never reword existing copy or newsletter text.** Re-layout and
  re-typeset freely; words and numbers stay identical. Issue `content`
  is transcribed word-for-word from Substack, never paraphrased.
- **No credential or title labels anywhere new** — no certification
  badges, "Level X" pills, seals or taglines in copy, meta tags,
  structured data or alt text. Existing copy that already mentions them
  stays as it is; nothing new repeats it. No new claims about the owner.
- Fund names are **examples of data, not recommendations**. Keep every
  disclaimer visible where it exists; any tool surface shows
  `<ToolDisclaimer />` ("Educational, not investment advice…").
- The newsletter is **personal finance / investing** broadly —
  compounding is one theme, not the scope.
- Voice: terse, first-person, concrete, no marketing fluff, no
  exclamation marks. Interface labels read like engraved panel text
  (see §5 readouts) and may be added freely — but labels are not claims.

## 4. Design concept: SIGNAL / NOISE

The whole site is **one calibrated phosphor oscilloscope in a control
room**. Everything starts as noise and resolves into signal when given
attention; every section is a numbered channel (`CH-01`…`CH-07`);
motion obeys control theory (an underdamped step response: fast rise,
one overshoot, settle).

**Keep:** near-black instrument surfaces, a single hot colour (amber),
graticule grids, hairline borders, square corners, mono readouts with
units, huge condensed display type, traces that draw themselves,
stillness between readings (render on demand, hold at rest).

**Finance layer (elegance pass, see `DESIGN.md` → Direction):** a private
research desk. Key numbers huge, labels small and `engraved`; figures
tabular and right-aligned; section openers are statement line items
(`SectionHeader`: "02 · Label ···· CH-02" under a drawing rule); ledger
rows with hairlines and dotted `leader`s instead of card grids; a visible
12-column ruling (`chrome/ColumnRules`) and a soft vignette; **one glow per
view**. Signature interaction: `Crosshair` on key charts (snaps to real
samples only).

**Avoid:** rounded "card" UI and pill badges, gradients as decoration,
drop-shadowed floating cards, card grids where a statement row would
do, emoji, stock icons as illustration, light theme, more than one
accent colour on a component, motion that loops without meaning,
anything that looks like a SaaS template.

## 5. Design tokens (Tailwind v4, `src/index.css` `@theme`)

Always use tokens/utilities; never hardcode colours in components.
(Exception: canvas/SVG code that must interpolate colours in JS — then
use the hex values below and say so in a comment.)

### Colour — "Phosphor", dark only (`color-scheme: dark`, no light theme)

| Token | Value | Use |
| --- | --- | --- |
| `bg` | `#07090a` | page background |
| `panel` | `#0e1213` | raised modules (`.panel`) |
| `ink` | `#050606` | text on amber |
| `paper` | `#ebe7dc` | primary text |
| `accent` | `#ffb000` | CH1 amber — the one hot colour: primary buttons, active states, key numbers, traces |
| `teal` | `#5ad1c1` | CH2 cyan — secondary trace, eyebrow labels, "locked" status |
| `alarm` | `#ff5b3a` | errors, 404, REC light only |
| `line` | `rgba(235,231,220,.11)` | hairline borders |
| `grid` | `rgba(255,176,0,.07)` | graticule lines |

Chart series colours (from `src/data/newsletter.js`): `var(--color-accent)`,
`var(--color-teal)`, `#8a5a5a`. The correlation heatmap keeps the old
dark teal `#4e7c7a` → `#ffb000` scale on purpose (its caption says "dark
teal").

Text contrast floor on `bg`: body `text-paper/75`–`/85`, secondary
`/60`–`/65`. **Never below `/55`** for any readable text (Lighthouse a11y
is 100 — keep it there). Decorative-only glyphs may go lower.

### Typography

| Role | Family | Rules |
| --- | --- | --- |
| Display | **Anybody** (variable `wdth` 50–150, `wght` 300–900) | `font-display font-[800]`–`[850]` `uppercase`, `tracking-tight` or `tracking-[-0.02em]`–`[-0.035em]`, leading `0.8`–`0.95`, width via `[font-stretch:76%]`–`[85%]` (rest), `100%` on hover |
| Body / reading | **Newsreader** (wght 400–600, italic 400) | `font-body`; body 17px default; article text `text-[18px] sm:text-[19px] leading-[1.8]`; hooks/subtitles `italic text-xl` |
| Readout / UI | **Martian Mono** (wdth 75–112.5, wght 300–600) | `.readout` = 11px, `wdth 87.5`, `tracking-[0.12em]`, uppercase. `.engraved` = 10px, `wdth 80`, `tracking-[0.18em]` (labels under big figures). Buttons/links `font-mono text-[12px]`–`[13px]` |

Loaded from Google Fonts in `index.html`, non-blocking (preload +
`media="print"` swap + `<noscript>`). Newsreader is requested **without**
the `opsz` axis (24 kB vs 147 kB).

Always set weight/width with `font-weight` / `font-stretch`
(`font-[800]`, `[font-stretch:80%]`). **Never** use
`font-variation-settings` with a CSS `var()` inside — it computes as
invalid and silently drops to regular weight.

Display scale (use these, fluid where shown):

- Hero name: `text-[18.5vw]` → `lg:text-[min(10.5vw,188px)]`
- Page titles (`All issues`, `Try the analysis yourself`): `text-[15vw]`–`[22vw]` → `lg:text-[9.5rem]`–`[12rem]`
- Section words (`what I do`, `work`): `text-[16vw]`–`[22vw]` → `lg:text-[9rem]`–`[11rem]`
- Section statements (h2): `text-5xl sm:text-7xl lg:text-[5.6rem]`–`[6.2rem]`
- Issue h1: `text-[clamp(2.6rem,7.2vw,6.8rem)]`, `max-w-[15ch]`
- Module / card titles (h3): `text-3xl sm:text-4xl`, big module `lg:text-6xl`
- Stat numbers: `text-5xl sm:text-6xl lg:text-7xl tabular-nums`
- Article section heads: `text-3xl sm:text-[2.6rem]`

Every number shown as data uses `tabular-nums` (also set on `body`, so
figures line up site-wide). Statement utilities in `index.css`:
`engraved`, `leader` (dotted leader, flex filler), `ledger-row`
(baseline flex row + hairline), `vignette`.

- Hero key figure: `text-[21vw]` → `lg:text-[min(12vw,196px)]`; hero name
  is a one-line masthead at `lg` (`min(7.15vw,114px)`, two lines on phones)

### Spacing and layout grid

- Page container: `mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12`
  (issue page: `max-w-[1400px]`; reading column `max-w-[680px]`).
- Section rhythm: `py-20 lg:py-28`; top of a route `pt-24 lg:pt-28`/`32`
  (clears the fixed header).
- Grid: 12 columns at `lg`; asymmetric splits (`7/5`, `8/4`, `5/7`,
  `6/5/1`). Single column below `lg`. Gaps `gap-4` between modules,
  `gap-8`–`gap-12` between content columns.
- Issue page at `xl`: `grid-cols-[210px_minmax(0,680px)_110px]` (TOC rail
  / article / reading recorder).
- Breakpoints: design at **390 / 768 / 1440**. Mobile is designed on
  purpose (inset hero screen, full-screen menu, condensed type), not a
  shrunk desktop.
- `main` has `overflow-x: clip` (kinetic headings start wider than they
  rest). Use `clip`, never `hidden`, so sticky elements keep working.

### Radius, borders, elevation, texture

- **Square corners everywhere.** `rounded-full` only for LEDs, dots,
  screws and gauge pivots. No `rounded-lg` cards.
- Borders: 1px `border-line` (or `.hr-line`). Active/hover:
  `border-accent` or `border-accent/40`–`/60`.
- `.panel` = `bg-panel` + `border-line` + `--shadow-panel`
  (`inset 0 1px 0 rgba(235,231,220,.05), 0 20px 40px -24px rgba(0,0,0,.8)`).
- Glow: `.glow` (amber text-shadow 18px) and `shadow-phosphor`
  (`0 0 24px -4px rgba(255,176,0,.45)`) — only on the one thing that
  matters in a view (hero surname, key stat, active LED/trace).
- Texture: site-wide 32px dot graticule on `body`; `.graticule` (64px
  amber grid) inside screens; `GrainOverlay` noise; rack "screws"
  (`h-1.5 w-1.5 rounded-full bg-paper/15`) in panel corners;
  CRT scanlines via `repeating-linear-gradient(to bottom, rgba(0,0,0,.12) 0 1px, transparent 1px 3px)`.
- `.led` = 6px amber dot with glow and a slow 2.4s pulse (status only).
- `.text-outline` = transparent fill + 1px stroke in the text colour, for
  giant background numerals (`text-accent/15`–`/25`).

## 6. Motion rules

Library: Framer Motion (`framer-motion`). Shared values in
`src/lib/motion.js` — import them, never invent new curves.

| Name | Value | Use |
| --- | --- | --- |
| `sweep` (`EASE_OUT`, class `ease-sweep`) | `[0.16, 0.9, 0.2, 1]` | reveals, wipes, traces drawing |
| `settle` (`SETTLE`, class `ease-settle`) | spring `stiffness 170, damping 13` (ζ≈0.5) / `cubic-bezier(0.34,1.56,0.64,1)` | arrivals, gauges, magnetic return |
| `switch` (`EASE_IN_OUT`, class `ease-switch`) | `[0.65, 0, 0.35, 1]` | route/channel switches, exits |
| `SPRING_SNAP` / `SPRING_SOFT` | existing | portfolio tool internals only |

Durations: micro/hover **120–180ms**; hover sweeps **300–500ms**;
section reveals **600–800ms**; traces/heading width settle **1.1–1.7s**.
Stagger: **60–100ms** per item (`delay: i * 0.08`), words **40–60ms**.

Rules:

1. Things move when they **arrive**, when the **user acts**, or when
   **data changes**. Otherwise still. The only continuous loops are the
   hero trace, the footer Lissajous, the data ticker and LED pulse —
   all paused off-screen (IntersectionObserver + `visibilitychange`),
   ticker pauses on hover/focus. The hero WebGL field (`HeroField`)
   persists but renders only on arrival, pointer and scroll, then holds.
2. Animate `transform`, `opacity`, `clip-path`, canvas — never layout.
   (Documented exceptions: hero letter lens and heading `font-stretch`.)
3. Nothing flashes more than 3×/second.
4. **Never hide prerendered first-paint content.** Entrance animations
   run only after a client-side navigation: gate with
   `isInitialLoad()` from `src/lib/firstLoad.js`. Hero text is visible
   in the static HTML (keeps LCP fast).
5. Standard reveal: `reveal(reduceMotion, { delay })` from
   `lib/motion.js`, or
   `initial={reduceMotion ? false : { opacity: 0, y: 18 }}` +
   `whileInView={{ opacity: 1, y: 0 }}` +
   `viewport={{ once: true, amount: 0 }}`.
6. **Viewport options: always `amount: 0`, never a negative `margin` or
   nonzero `amount`** — in this environment observers with those stop
   re-firing and content stays stuck invisible.
7. Masked word/line reveals are driven by the **parent heading's**
   `whileInView` through variants (`SplitHeading`, `KineticHeading`) —
   a child that starts masked inside `overflow-hidden` can't observe
   itself.
8. Scroll-linked effects use `useScroll` + `useTransform` (parallax
   ±50–160px, progress bars `scaleX`/`scaleY`, springs
   `stiffness 120, damping 24`).
9. Scroll-*scrubbed* sequences (the Day 29 replay, home `Chapters`) use
   GSAP + ScrollTrigger, dynamically imported by that component, driven
   through `driveWithGsap` (`lib/ticker.js`) so Lenis and ScrollTrigger
   share one frame; pin with CSS `sticky` inside a tall section, never
   GSAP `pin`. Ease with `bezierEase(EASE_IN_OUT)` from `lib/motion.js`.
   Desktop + motion only; everything else gets the stacked static version.

**Reduced motion is a designed alternative, not just "off"**: check
`useReducedMotion()` (Framer) or `useReducedMotionPref()` (`lib/env.js`,
SSR-safe) and render the resolved state — static SVG curve instead of
the canvas, static email line instead of the marquee, instant reveals,
no boot sequence, no probe cursor, no Lenis. A global CSS block also
zeroes animation/transition durations.

Route transitions: internal links use `chrome/TransitionLink` (View
Transitions API: scanline "channel switch" wipe, chunk preloaded on
hover). Shared-element morph: give both ends the same
`style={{ viewTransitionName: "issue-title-<id>" }}`. Browsers without
View Transitions get the `.route-enter` CSS fade-up.

## 7. Components and file structure

```
src/
  App.jsx              routes, Home composition, RouteEffects (head tags, scroll reset)
  entry-server.jsx     SSR render for scripts/prerender.mjs
  index.css            @theme tokens, utilities, keyframes, print styles
  components/
    chrome/            site shell: Header, Effects (Lenis, probe, palette, Konami, toast),
                       ProbeCursor, CommandPalette, TransitionLink, ErrorBoundary,
                       GrainOverlay, RouteFallback
    PortfolioBuilder/  the portfolio tool (engine-backed; presentation only may change)
    Hero, DataTicker, ProofStrip, WhatIDo, Newsletter (Chapters), Work, Footer   (home, in order)
    IssueChart (SignalChart, ChartLegend), IssueContent (IssueBody, Lightbox),
    IssueToc (TocRail, TocInline), ReadingRecorder                                (issue page)
    SectionHeader, SplitHeading, KineticHeading, ClipReveal, Magnetic,
    Crosshair, Sparkline, ToolDisclaimer, ShareButton, Lissajous, Flatline, icons/ (shared)
  pages/               NewslettersIndex, NewsletterIssue, Tools, NotFound
  lib/                 motion, env, firstLoad, settings, transition, routeChunks, scroll, series,
                       signal, sfx/sound, palette, seo, headings, useCountUp,
                       useActiveHeading, portfolioEngine/ (maths + tests — do not change)
  data/                newsletter.js, projects.js, links.js, tools.js, toolRegistry.js
public/newsletter(s)/  chart PNGs + generated .webp siblings
```

Naming and code style:

- Components `PascalCase.jsx`, one default export; helpers/hooks in
  `src/lib/*.js` (`camelCase`, hooks start with `use`). Non-component
  exports don't go in `.jsx` files (keeps fast refresh + lint clean).
- No semicolons in site code (the `portfolioEngine/` and older
  `PortfolioBuilder/` files use them — match the file you're in).
  Double quotes. Comments explain *why*, in full sentences.
- Anything using `window`, `document`, canvas or WebGL must be
  client-only (inside `useEffect`, or behind `useSyncExternalStore`
  client checks) so `npm run build` prerender still succeeds.
- Heavy/optional pieces are lazy: route pages via `lib/routeChunks.js`;
  Recharts only inside `IssueChart.jsx`'s chunk; tools via
  `toolRegistry.js`; Lenis, probe cursor, palette and sound are
  dynamically imported by `Effects.jsx`.

Reusable building blocks (use these before writing new ones):

- **Section opener:** `<SectionHeader channel="CH-0X" label="…" />` then
  `<SplitHeading text="…" className="font-display …" />`.
- **Module/card:** `className="panel p-6 sm:p-8"`, readout tag
  (`CH-03.1`, `M-01`, `T-01`) at top-left, optional giant background
  numeral.
- **Primary button:** `inline-flex h-11 items-center gap-2 bg-accent px-4
  font-mono text-[13px] font-medium text-ink hover:bg-paper`, wrap in
  `<Magnetic>` on hero/feature CTAs.
- **Secondary button:** `h-11 border border-line px-4 text-paper
  hover:border-accent hover:text-accent`.
- **Text link:** `text-accent underline decoration-accent/30
  underline-offset-4 hover:decoration-accent`.
- **Row hover:** absolute span `bg-accent` (or `/7`) with
  `origin-left scale-x-0 group-hover:scale-x-100 duration-500 ease-sweep`.
- **Cursor states:** add `data-cursor="lock" | "read" | "probe" | "drag" | "measure"`
  to interactive elements (links/buttons default to `lock`, issue
  cards `read`, charts `probe`; `Crosshair` sets `measure`, which hides
  the probe's hairlines so only one crosshair shows).
- **Crosshair:** `<Crosshair read={(fx, fy) => ({ x, y, label, value, note })} />`
  absolutely over a plot box; `read` must snap to a real data point.
- **Statement row:** `<div className="ledger-row py-2"><dt className="engraved …">Label</dt>
  <span aria-hidden="true" className="leader" /><dd className="font-mono tabular-nums …">₹4.72Cr</dd></div>`.
- **Scroll containers** inside the page need `data-lenis-prevent`.

Recharts styling (see `IssueChart.jsx` → `SignalChart`):

- Wrap in `.panel.graticule` screen; `ResponsiveContainer` 100%.
- `CartesianGrid stroke="rgba(255,176,0,0.08)"`; axis ticks
  `{ fill: "rgba(235,231,220,0.62)", fontSize: 10, fontFamily: "var(--font-mono)" }`,
  `tickLine={false}`, y-axis `width={52}`, `margin.left: 0` (negative
  margins clip ₹ labels).
- Lines: `strokeWidth={2.25}`, `dot={false}`, `type="monotone"`,
  phosphor glow `style={{ filter: \`drop-shadow(0 0 5px ${color})\` }}`,
  `animationDuration={1700}`, `animationBegin={i * 220}`,
  `isAnimationActive={!reduceMotion}`; mount the chart only once in view
  (`useInView`) so lines draw where the reader can see them.
- No Recharts `Tooltip`: a `Crosshair` overlay over the plot area
  (YAxis width + margins) snaps to the sampled year and nearest series;
  the y domain is set explicitly so overlay and lines share one scale.
- Legend: `ChartLegend` — 16px × 2px glowing line swatch + label.

lucide-react styling: icons are small and functional only — `size`
12–15 inline with mono text (18–28 on large rows), inherit colour
(`currentColor`), `transition-transform` nudges on hover
(`group-hover:translate-x-0.5 group-hover:-translate-y-0.5` for
`ArrowUpRight`). Brand marks use `components/icons/` (GithubMark,
LinkedinMark), not lucide.

## 8. Newsletter data (`src/data/newsletter.js`)

Each entry in `issues`: `id` (URL slug), `number`, `title`, `hook`,
`date` ("Sep 30, 2026"), `readingTime`, `coverImage`, `substackUrl`,
`githubUrl`, optional `tool` (key in `toolRegistry.js`), `stats` (4
`{ label, value }` callouts), `headline` (index of the stat shown as the
headline figure), optional `chart` (`{ years, series }`), optional `spark`
(`{ label, unit, kind: "line" | "bars", values }` — only real computed
values; without it the filings index draws the chart's first series),
and `content` blocks:

- `{ type: "p", text }` — supports `**bold**`, `*italic*`, `[text](url)`
- `{ type: "h2", text }` — becomes a numbered § section + TOC entry
- `{ type: "quote", text }`, `{ type: "list", items }`
- `{ type: "image", src, alt, width, height, caption }` — PNG in
  `public/newsletter(s)/`; run `python scripts/make-webp.py` for the WebP
- `{ type: "tool", name }` — embeds a registered tool with disclaimer

**Adding an issue:** transcribe the Substack post exactly into a new
object, add images + WebP, `npm test` (checks images, dimensions, alt,
heading ids), `npm run build` (adds prerender page, sitemap, RSS). No
component changes needed. Issue pages render at `/newsletters/<id>`.

## 9. Commands and checks

```
npm run dev          # vite dev server, http://localhost:5173
npm run build        # client + SSR build, prerender every route to dist/
npm run preview      # serves dist/ (SPA shell only — check dist/ files for prerendered HTML)
npm run lint         # oxlint
npm test             # node:test unit tests (engine maths, newsletter data, headings)
npm run test:routes  # SSR build + render every route; fails on throw or accidental 404
```

Before calling any piece done: `npm run lint`, `npm test`,
`npm run build`, `npm run test:routes` all pass, and screenshots at
390px and 1440px look right
(`node scripts/screenshot.mjs <url> <width> <out.png> [scrollY] [js]`,
`MOUSE="x,y;x,y"` for hover states; it reports horizontal overflow).
Keep Lighthouse mobile accessibility at 100 and performance no lower
than the numbers recorded in `DESIGN.md`. CI
(`.github/workflows/ci.yml`) runs the same checks on PRs.
