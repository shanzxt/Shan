import { Suspense, lazy, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import ProofStrip from "./components/ProofStrip"
import WhatIDo from "./components/WhatIDo"
import Work from "./components/Work"
import GrainOverlay from "./components/chrome/GrainOverlay"
import Header from "./components/chrome/Header"

// Recharts pulls its own weight — split it out of the main bundle since it
// only matters once someone scrolls to the newsletter section.
const Newsletter = lazy(() => import("./components/Newsletter"))

// Framer Motion-heavy interactive demo, only needed on its own route.
const PortfolioBuilder = lazy(() => import("./components/PortfolioBuilder/PortfolioBuilder"))

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
  return (
    <>
      <GrainOverlay />
      <Header />
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
      </Routes>
    </>
  )
}
