# Roadmap: feature/next-level

Ranked by impact / effort for this repo as audited on 2026-09-30.

## Audit snapshot

- Branch `feature/next-level` cut from `staging` (clean, at `caeeb5e`).
- Already present: `/newsletters` index + `/newsletters/:slug` reading pages
  (data in `src/data/newsletter.js`), tool registry (`fund-picker`), prev/next,
  Substack subscribe link, `/portfolio` tool, engine unit tests
  (`src/lib/portfolioEngine/*.test.js`, `node:test`, 14 passing, no npm script).
- Missing: sitemap, robots.txt, feed, JSON-LD, canonical, prerendering, 404
  page, error boundary, analytics, CI, `vercel.json`.
- **Live bug**: `https://www.shantests.in/newsletters/day-29` returns HTTP 404
  on a direct load (no SPA fallback on Vercel). Only in-app navigation works.
- Baseline build (gzip): main `index` 92.3 kB, `motion` 43.8 kB,
  `IssueContent` 112.3 kB (Recharts bundled with the article body),
  `FundPickerTool` 34.8 kB, CSS 7.1 kB. Google Fonts stylesheet is
  render-blocking. Chart PNGs are 90–380 kB each, no width/height.
- Lighthouse CLI not installed; skipped (not adding it as a dependency).

## Ranked items

1. **Prerender + SEO** (fixes the live 404 too). Build-time prerender of
   `/`, `/newsletters`, every issue, `/portfolio`, `/tools`, `/404` using
   React 19's own `react-dom/static` + a Vite SSR build — no new dependency.
   Per-page title/description/canonical/OG/Twitter, JSON-LD (Person,
   Article; no credential claims), `sitemap.xml`, `robots.txt`, `feed.xml`
   (RSS). **Done when** `dist/` contains a static HTML file per route with
   real content and head tags, and the three XML/text files are generated.
2. **Performance.** Split Recharts out of the article body chunk, non-blocking
   font loading, WebP copies of chart images with width/height, `loading=lazy`.
   **Done when** before/after bundle sizes are recorded and the article chunk
   no longer carries Recharts.
3. **404 page + error boundary.** **Done when** unknown routes render a real
   404 page (and `404.html` is served with status 404) and a render error
   shows a recoverable fallback instead of a blank screen.
4. **Reading experience.** Reading progress bar, table of contents from `h2`s,
   copy-link/share, print styles. (Prev/next and subscribe CTA exist.)
   **Done when** an issue page has all four and they are keyboard-usable.
5. **Tools hub.** `/tools` listing each registry tool, description, link to
   its issue, "educational, not investment advice" note on the hub and tool
   panel. **Done when** `/tools` is in nav, sitemap and prerender.
6. **Correctness.** `npm test` script over the existing `node:test` suites
   (kept instead of adding vitest — same coverage, zero dependencies) plus a
   route smoke test that server-renders every route. **Done when** `npm test`
   passes and fails if any route throws.
7. **Design polish.** Visible `:focus-visible` rings, skip-to-content link,
   mobile nav (current nav is a horizontally scrolling strip). **Done when**
   keyboard focus is visible everywhere and nav is usable at 390px.
8. **Analytics.** Vercel Web Analytics (`@vercel/analytics`, ~1 kB, cookieless).
   Needs a dashboard toggle. **Done when** component mounted + steps in
   PROGRESS.md.
9. **Repo hygiene.** README rewrite, GitHub Action (lint + test + build on PRs).

Dropped: newsletters section (already exists), markdown/MDX migration of
issues (existing JS data file already meets "one content entry + images";
migrating would add an MDX toolchain for no reader-facing gain), LazyMotion
(framer-motion is used in ~20 files with `motion.*`; converting all to `m.*`
is broad for ~15 kB — revisit later).

## New dependencies

- `@vercel/analytics` — cookieless page-view analytics, ~1 kB, first-party
  on Vercel. Only new runtime dependency.
