# PROGRESS: feature/next-level

Resume here. See ROADMAP.md for the ranked item list and definitions of done.
Branch: `feature/next-level` (from `staging`). Nothing pushed; commit locally only.

## Done
- Phase 0 audit + ROADMAP.md

## In progress
- Item 1: prerender + SEO

## Next
- Items 2–9 in ROADMAP.md order

## Decisions
- Site URL for canonical/sitemap/feed: `https://www.shantests.in` (live domain per user; README/CLAUDE.md still say shantanusomwanshi.com).
- Kept `node:test` instead of adding vitest: 14 engine tests already exist and pass.
- Newsletter issues stay in `src/data/newsletter.js` (no MDX migration).
- Existing credential wording in Hero/WhatIDo/index.html description left untouched (user rule: leave existing copy). No new meta/JSON-LD/OG text repeats it.

## Gotchas
- Lighthouse CLI not installed; skipped.
- Live site deep links (`/newsletters/day-29`) return 404 on hard load: no SPA fallback configured on Vercel.

## Manual / dashboard steps for the user
- (none yet)
