import { Suspense, lazy, useEffect, useRef } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import ProofStrip from "./components/ProofStrip"
import WhatIDo from "./components/WhatIDo"
import Work from "./components/Work"
import ErrorBoundary from "./components/chrome/ErrorBoundary"
import GrainOverlay from "./components/chrome/GrainOverlay"
import Header from "./components/chrome/Header"
import NotFound from "./pages/NotFound"

// Recharts pulls its own weight — split it out of the main bundle since it
// only matters once someone scrolls to the newsletter section.
const Newsletter = lazy(() => import("./components/Newsletter"))

// Framer Motion-heavy interactive demo, only needed on its own route.
const PortfolioBuilder = lazy(() => import("./components/PortfolioBuilder/PortfolioBuilder"))

const NewslettersIndex = lazy(() => import("./pages/NewslettersIndex"))
const NewsletterIssue = lazy(() => import("./pages/NewsletterIssue"))
const Tools = lazy(() => import("./pages/Tools"))

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
    if (!hash) window.scrollTo(0, 0)
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
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [location])

  return (
    <div className="bg-bg">
      <Hero />
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

export default function App() {
  const { pathname } = useLocation()

  return (
    <>
      <GrainOverlay />
      <Header />
      <RouteEffects />
      <ErrorBoundary key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/portfolio"
            element={
              <Suspense fallback={<div className="min-h-screen bg-bg" />}>
                <PortfolioBuilder />
              </Suspense>
            }
          />
          <Route
            path="/newsletters"
            element={
              <Suspense fallback={<div className="min-h-screen bg-bg" />}>
                <NewslettersIndex />
              </Suspense>
            }
          />
          <Route
            path="/newsletters/:slug"
            element={
              <Suspense fallback={<div className="min-h-screen bg-bg" />}>
                <NewsletterIssue />
              </Suspense>
            }
          />
          <Route
            path="/tools"
            element={
              <Suspense fallback={<div className="min-h-screen bg-bg" />}>
                <Tools />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </>
  )
}
