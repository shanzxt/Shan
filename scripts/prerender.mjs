// Post-build step: renders every route to static HTML in dist/, plus
// 404.html, sitemap.xml, robots.txt and feed.xml. Runs after both
// `vite build` (client) and `vite build --ssr` (dist-ssr/entry-server.js).
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

const root = path.resolve(import.meta.dirname, "..")
const dist = path.join(root, "dist")
const server = await import(pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href)
const { render } = server
const { routeMeta, headHtml, prerenderRoutes, issuePath, isoDate, absoluteUrl, SITE_URL, SITE_NAME, FEED_PATH } = await server.loadSeo()
const { issuesByDate } = await server.loadIssues()

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8")

function page(url, appHtml) {
  const meta = routeMeta(url)
  let html = template.replace(/<title>.*?<\/title>/s, headHtml(meta))
  // Home keeps index.html's own description; every other route brings its own.
  if (meta.description !== null) html = html.replace(/\s*<meta name="description"[^>]*>/, "")
  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

function write(file, contents) {
  const out = path.join(dist, file)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, contents)
}

const routes = prerenderRoutes()
for (const url of routes) {
  const file = url === "/" ? "index.html" : `${url.slice(1)}/index.html`
  write(file, page(url, await render(url)))
}
write("404.html", page("/404", await render("/404")))

const xmlEscape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const lastmod = (url) => {
  const issue = issuesByDate.find((i) => issuePath(i) === url)
  return issue ? `<lastmod>${isoDate(issue.date)}</lastmod>` : ""
}
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((url) => `  <url><loc>${absoluteUrl(url === "/" ? "/" : url)}</loc>${lastmod(url)}</url>`).join("\n")}
</urlset>
`,
)

write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)

const rfc822 = (date) => new Date(`${isoDate(date)}T12:00:00Z`).toUTCString()
write(
  FEED_PATH.slice(1),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_NAME)} — Newsletter</title>
    <link>${SITE_URL}/newsletters</link>
    <atom:link href="${SITE_URL}${FEED_PATH}" rel="self" type="application/rss+xml" />
    <description>A personal finance and investing newsletter, on real data and public code.</description>
    <language>en</language>
${issuesByDate
  .map(
    (issue) => `    <item>
      <title>${xmlEscape(issue.title)}</title>
      <link>${absoluteUrl(issuePath(issue))}</link>
      <guid isPermaLink="true">${absoluteUrl(issuePath(issue))}</guid>
      <pubDate>${rfc822(issue.date)}</pubDate>
      <description>${xmlEscape(issue.hook)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`,
)

console.log(`prerendered ${routes.length} routes + 404, sitemap.xml, robots.txt, ${FEED_PATH.slice(1)}`)
