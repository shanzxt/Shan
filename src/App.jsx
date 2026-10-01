import { Suspense, lazy, useEffect, useRef } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { Analytics } from "@vercel/analytics/react"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import ProofStrip from "./components/ProofStrip"
import WhatIDo from "./components/WhatIDo"
import Work from "./components/Work"
import Effects from "./components/chrome/Effects"
import ErrorBoundary from "./components/chrome/ErrorBoundary"
import GrainOverlay from "./components/chrome/GrainOverlay"
import Header from "./components/chrome/Header"
import RouteFallback from "./components/chrome/RouteFallback"
import NotFound from "./pages/NotFound"
import { isInitialLoad, trackLocation } from "./lib/firstLoad"
import { routeChunks } from "./lib/routeChunks"
import { scrollToElement, scrollToTop } from "./lib/scroll"
import { supportsViewTransitions } from "./lib/transition"

// Recharts and the newsletter data pull their own weight — split out of
// the main bundle since they only matter once someone scrolls down.
const Newsletter = lazy(routeChunks.newsletter)
const DataTicker = lazy(() => import("./components/DataTicker"))

// Framer Motion-heavy interactive demo, only needed on its own route.
const PortfolioBuilder = lazy(routeChunks.portfolio)

const NewslettersIndex = lazy(routeChunks.newslettersIndex)
const NewsletterIssue = lazy(routeChunks.newsletterIssue)
const Tools = lazy(routeChunks.tools)

// Keeps <head> in sync on client-side navigation and resets scroll for
// plain route changes. The first render is skipped: the prerendered HTML
// already carries that route's head tags.
function RouteEffects() {
  const { pathname, hash } = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!hash) scrollToTop()
    import("./lib/seo").then(({ applyRouteMeta }) => applyRouteMeta(pathname))
  }, [pathname, hash])

  return null
}

function Home() {
  const location = useLocation()

  // Header nav links always go through `/#id` (works whether the reader is
  // already on `/` or crossing over from `/portfolio`); this makes the
  // cross-route case actually scroll once the route lands.
  useEffect(() => {
    if (!location.hash) return
    const el = document.querySelector(location.hash)
    if (el) scrollToElement(el)
  }, [location])

  return (
    <div>
      <Hero />
      <Suspense fallback={<div className="h-[52px] border-y hr-line" />}>
        <DataTicker />
      </Suspense>
      <ProofStrip />
      <WhatIDo />
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <Newsletter />
      </Suspense>
      <Work />
      <Footer />
    </div>
  )
}

function Lazy({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

export default function App() {
  const { pathname, key } = useLocation()
  trackLocation(key)
  // Browsers without View Transitions get a CSS entrance on client-side
  // route changes instead; the first (prerendered) route never animates.
  const enterClass = !isInitialLoad() && !supportsViewTransitions() ? "route-enter" : ""

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>
      <GrainOverlay />
      <Header />
      <RouteEffects />
      <main id="main" tabIndex={-1} className="outline-none">
        <ErrorBoundary key={pathname}>
          <div className={enterClass}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/portfolio" element={<Lazy><PortfolioBuilder /></Lazy>} />
              <Route path="/newsletters" element={<Lazy><NewslettersIndex /></Lazy>} />
              <Route path="/newsletters/:slug" element={<Lazy><NewsletterIssue /></Lazy>} />
              <Route path="/tools" element={<Lazy><Tools /></Lazy>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ErrorBoundary>
      </main>
      <Effects />
      {/* Cookieless page views; only reports on Vercel once enabled in the dashboard. */}
      <Analytics />
    </>
  )
}
