import { issuesByDate } from "../data/newsletter"
import { links } from "../data/links"

// Per-route head metadata. Used twice: at build time by
// `scripts/prerender.mjs` (baked into each route's static HTML) and at
// runtime by `applyRouteMeta` on client-side navigation. This module pulls
// in the full newsletter data, so the client only ever `import()`s it.

export const SITE_URL = "https://www.shantests.in"
export const SITE_NAME = "Shantanu Somwanshi"
export const DEFAULT_IMAGE = "/og-default.png"
export const FEED_PATH = "/feed.xml"

// Home keeps the description already in `index.html`; this one is only the
// fallback for social cards and pages without their own.
export const DEFAULT_DESCRIPTION =
  "Shantanu Somwanshi — instrumentation engineer and writer of a personal finance & investing newsletter, with the code shipped publicly."

const person = {
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  sameAs: [links.github, links.linkedin, links.newsletter],
}

export function issuePath(issue) {
  return `/newsletters/${issue.id}`
}

// "Sep 6, 2026" → "2026-09-06"
export function isoDate(date) {
  const d = new Date(`${date} 12:00 UTC`)
  return d.toISOString().slice(0, 10)
}

export function absoluteUrl(path) {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`
}

export function routeMeta(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/"

  if (path === "/") {
    return {
      title: SITE_NAME,
      description: null,
      ogDescription: DEFAULT_DESCRIPTION,
      path,
      jsonLd: { "@context": "https://schema.org", ...person },
    }
  }

  if (path === "/newsletters") {
    return {
      title: `Newsletter — ${SITE_NAME}`,
      description: "Every issue of the newsletter, on real data and public code.",
      path,
    }
  }

  if (path === "/portfolio") {
    return {
      title: `Portfolio tool — ${SITE_NAME}`,
      description:
        "Pick funds and see how many independent bets they really add up to — built on the data behind “44 funds, 2 bets”.",
      path,
    }
  }

  if (path === "/tools") {
    return {
      title: `Tools — ${SITE_NAME}`,
      description: "Interactive tools built from the newsletter's own analysis.",
      path,
    }
  }

  const issue = issuesByDate.find((i) => issuePath(i) === path)
  if (issue) {
    const image = issue.coverImage ?? DEFAULT_IMAGE
    return {
      title: `${issue.title} — ${SITE_NAME}`,
      description: issue.hook,
      path,
      image,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: issue.title,
        description: issue.hook,
        datePublished: isoDate(issue.date),
        image: absoluteUrl(image),
        url: absoluteUrl(path),
        mainEntityOfPage: absoluteUrl(path),
        author: person,
      },
    }
  }

  return {
    title: `Not found — ${SITE_NAME}`,
    description: "This page doesn't exist.",
    path,
    noindex: true,
  }
}

// Every route the prerenderer writes, in sitemap order.
export function prerenderRoutes() {
  return ["/", "/newsletters", ...issuesByDate.map(issuePath), "/portfolio"]
}

function metaTags(meta) {
  const description = meta.ogDescription ?? meta.description ?? DEFAULT_DESCRIPTION
  const image = absoluteUrl(meta.image ?? DEFAULT_IMAGE)
  const tags = [
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: meta.title },
    { property: "og:description", content: meta.description ?? description },
    { property: "og:type", content: meta.type ?? "website" },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: meta.title },
    { name: "twitter:description", content: meta.description ?? description },
    { name: "twitter:image", content: image },
  ]
  if (!meta.noindex) tags.push({ property: "og:url", content: absoluteUrl(meta.path) })
  if (meta.description) tags.unshift({ name: "description", content: meta.description })
  if (meta.noindex) tags.push({ name: "robots", content: "noindex" })
  return tags
}

const escapeAttr = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// Build-time: the HTML string injected into `<head>`.
export function headHtml(meta) {
  const out = [`<title>${escapeAttr(meta.title)}</title>`]
  for (const { name, property, content } of metaTags(meta)) {
    const key = name ? `name="${name}"` : `property="${property}"`
    out.push(`<meta ${key} content="${escapeAttr(content)}" data-seo />`)
  }
  if (!meta.noindex) out.push(`<link rel="canonical" href="${absoluteUrl(meta.path)}" data-seo />`)
  out.push(`<link rel="alternate" type="application/rss+xml" title="${SITE_NAME}" href="${FEED_PATH}" />`)
  if (meta.jsonLd) {
    const json = JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")
    out.push(`<script type="application/ld+json" data-seo>${json}</script>`)
  }
  return out.join("\n    ")
}

// Runtime: sync `<head>` after a client-side route change. Tags written by
// `headHtml` carry `data-seo` so they can be swapped wholesale; the plain
// `<meta name="description">` from `index.html` is left alone on home.
export function applyRouteMeta(pathname) {
  const meta = routeMeta(pathname)
  document.title = meta.title
  document.head.querySelectorAll("[data-seo]").forEach((el) => el.remove())
  const template = document.createElement("template")
  template.innerHTML = headHtml(meta)
  template.content.querySelectorAll("[data-seo]").forEach((el) => {
    if (el.getAttribute("name") === "description") {
      const existing = document.head.querySelector('meta[name="description"]:not([data-seo])')
      if (existing) existing.remove()
    }
    document.head.appendChild(el)
  })
}
