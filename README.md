# Shantanu Somwanshi — personal site

Live at <https://www.shantests.in>. A personal finance / investing newsletter,
its issues, and interactive tools built on the same data.

Vite + React 19 + Tailwind CSS v4 + Framer Motion + Recharts + lucide-react.
No backend, no CMS. Every route is prerendered to static HTML at build time
and deployed on Vercel.

## Setup

Node 22.12+ (or 20.19+, per Vite's engines).

```
npm install
npm run dev            # vite dev server
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Client build, SSR build (`dist-ssr/`), then `scripts/prerender.mjs` writes a static HTML page per route plus `404.html`, `sitemap.xml`, `robots.txt`, `feed.xml` into `dist/` |
| `npm run preview` | Serves `dist/` (always the SPA shell, not the per-route HTML — check `dist/` directly for that) |
| `npm run lint` | oxlint |
| `npm test` | Unit tests (`node:test`): portfolio maths engine, newsletter image checks, heading ids |
| `npm run test:routes` | SSR build + server-renders every route, fails if any throws or falls through to 404 |

CI (`.github/workflows/ci.yml`) runs lint, tests, build and the route smoke
test on every PR and on pushes to `staging`/`main`.

No environment variables are needed.

## Routes

- `/` — landing page
- `/newsletters` — all issues; `/newsletters/<id>` — one issue (table of contents, share, print styles, prev/next)
- `/tools` — interactive tools hub; `/portfolio` — fund picker / correlation heatmap
- anything else — 404 page

## Adding a newsletter issue

1. Push a new object into `issues` in `src/data/newsletter.js` (schema in
   `CLAUDE.md`). Transcribe the published Substack text exactly; don't
   paraphrase.
2. Drop chart PNGs into `public/newsletter/` or `public/newsletters/<id>/`,
   set `width`/`height`/`alt` on each image block, then run
   `python scripts/make-webp.py` (needs Pillow) to create the WebP copies.
3. `npm test` checks every image exists with a WebP sibling, dimensions and
   alt text. `npm run build` adds the issue to the prerender, sitemap and
   RSS feed automatically.

To attach an interactive tool, register the component in
`src/data/toolRegistry.js`, reference it from the issue with a
`{ type: "tool", name }` block, and list it in `src/data/tools.js` for `/tools`.

## Deploying

`staging` deploys a Vercel preview; `main` is production. See the deployment
rules in `CLAUDE.md`.
