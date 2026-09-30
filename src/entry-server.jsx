import { StrictMode } from "react"
import { prerenderToNodeStream } from "react-dom/static"
import { StaticRouter } from "react-router-dom"
import App from "./App.jsx"

// Loaded lazily so the head/sitemap helpers share the lazy chunk graph
// with the client (avoids an ineffective-dynamic-import warning).
export const loadSeo = () => import("./lib/seo")
export const loadIssues = () => import("./data/newsletter")

// Build-time only (see scripts/prerender.mjs). `prerenderToNodeStream`
// waits for every lazy route/tool to resolve, so the HTML carries the
// real page content rather than a Suspense fallback.
// `options` goes straight to React (the route smoke test passes `onError`,
// since errors inside a Suspense boundary otherwise only fall back silently).
export async function render(url, options) {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
    options,
  )
  let html = ""
  for await (const chunk of prelude) html += chunk
  return html
}
