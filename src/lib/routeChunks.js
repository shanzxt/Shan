// One import() per lazy route, shared by App's `lazy()` calls and by
// TransitionLink's preloading — calling the same import twice returns the
// same module, so hovering a link warms exactly the chunk the route uses.
export const routeChunks = {
  newsletter: () => import("../components/Newsletter"),
  portfolio: () => import("../components/PortfolioBuilder/PortfolioBuilder"),
  newslettersIndex: () => import("../pages/NewslettersIndex"),
  newsletterIssue: () => import("../pages/NewsletterIssue"),
  tools: () => import("../pages/Tools"),
}

export function chunkForPath(pathname) {
  if (pathname === "/portfolio") return routeChunks.portfolio
  if (pathname === "/newsletters") return routeChunks.newslettersIndex
  if (pathname.startsWith("/newsletters/")) return routeChunks.newsletterIssue
  if (pathname === "/tools") return routeChunks.tools
  return null
}
