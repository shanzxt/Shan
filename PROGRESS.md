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

## In progress
- (none)

## Next
- Item 6 correctness (route smoke test), then 7-9

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
- Pre-existing, left for item 7: header nav scrolls horizontally at 390px; the masthead chart's y-axis labels lose
  their leading ₹ at narrow widths (`left: -16` margin in IssueChart).
- PROGRESS.md was cp1252 + CRLF at one point; it is now UTF-8. Edit it as UTF-8.

## Manual / dashboard steps for the user
- (none yet)
