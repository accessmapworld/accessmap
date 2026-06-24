import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useStore } from './store/useStore'
import AccessibilityPanel from './components/AccessibilityPanel'

// Route-level code splitting — keeps the initial bundle small. Heavy deps
// (Leaflet on /map, gsap/ogl/motion on /) only load for the route that needs them.
const Home = lazy(() => import('./pages/Home'))
const MapPage = lazy(() => import('./pages/MapPage'))
const PlaceDetail = lazy(() => import('./pages/PlaceDetail'))
const RoutePlanner = lazy(() => import('./pages/RoutePlanner'))
const Report = lazy(() => import('./pages/Report'))
const SubmitReview = lazy(() => import('./pages/SubmitReview'))
const Profile = lazy(() => import('./pages/Profile'))
const Admin = lazy(() => import('./pages/Admin'))
const BusinessRegister = lazy(() => import('./pages/BusinessRegister'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Councils = lazy(() => import('./pages/Councils'))
const Security = lazy(() => import('./pages/Security'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden="true" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">This page doesn’t exist</h1>
      <p className="max-w-sm text-muted">The link may be broken, or the page may have moved.</p>
      <div className="flex gap-3">
        <Link to="/" className="btn-ghost">Home</Link>
        <Link to="/map" className="btn-primary">Open the map</Link>
      </div>
    </div>
  )
}

export default function App() {
  const initAuth = useStore((s) => s.initAuth)
  useEffect(() => { initAuth() }, [initAuth])

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/route" element={<RoutePlanner />} />
          <Route path="/report" element={<Report />} />
          <Route path="/submit-review" element={<SubmitReview />} />
          <Route path="/business" element={<BusinessRegister />} />
          <Route path="/councils" element={<Councils />} />
          <Route path="/security" element={<Security />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <AccessibilityPanel />
    </>
  )
}
