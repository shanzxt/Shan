# shantanusomwanshi.com

Personal site — Vite + React + Tailwind CSS v4 + Framer Motion + Recharts + lucide-react.

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
```

## Structure

- `src/components/Hero.jsx` — the trace animation (flat signal → sharp bend), the one big motion moment
- `src/components/WhatIDo.jsx` — instrumentation background / newsletter / building software, three short blocks
- `src/components/Newsletter.jsx` + `IssueCard.jsx` — newsletter issues with a live Recharts mini-chart per issue, code-split from the main bundle
- `src/components/Work.jsx` — projects
- `src/components/Footer.jsx` — contact
- `src/data/newsletter.js` — real figures from the Day 29 issue, sampled at 5-year marks
- `src/data/projects.js` — project list
- `src/data/links.js` — shared profile links (GitHub, LinkedIn, newsletter, email)
- `src/lib/tracePath.js` — deterministic SVG path generator for the hero trace

Color/type tokens live in `src/index.css` under `@theme`.
