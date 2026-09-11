import { Suspense, lazy } from "react"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import WhatIDo from "./components/WhatIDo"
import Work from "./components/Work"

// Recharts pulls its own weight — split it out of the main bundle since it
// only matters once someone scrolls to the newsletter section.
const Newsletter = lazy(() => import("./components/Newsletter"))

export default function App() {
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
