// Suspense fallback for lazy routes: a sweep beam across a flat trace.
export default function RouteFallback() {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center px-6">
      <div className="w-64 max-w-full">
        <div className="relative h-px overflow-hidden bg-line">
          <div className="acquire-beam absolute inset-y-0 left-0 w-1/4 bg-accent shadow-phosphor" />
        </div>
        <p className="readout mt-3 text-paper/60">Acquiring signal…</p>
      </div>
    </div>
  )
}
