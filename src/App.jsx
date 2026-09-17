import { Suspense, lazy } from "react"
import { Routes, Route } from "react-router-dom"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import WhatIDo from "./components/WhatIDo"
import Work from "./components/Work"

// Recharts pulls its own weight — split it out of the main bundle since it
// only matters once someone scrolls to the newsletter section.
const Newsletter = lazy(() => import("./components/Newsletter"))

// Framer Motion-heavy interactive demo, only needed on its own route.
const PortfolioBuilder = lazy(() => import("./components/PortfolioBuilder/PortfolioBuilder"))

function Home() {
  return (
    <div className="bg-bg">
      <Hero />
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
  )
}
