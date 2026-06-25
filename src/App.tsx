import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useStore } from './store/useStore'
import AccessibilityPanel from './components/AccessibilityPanel'
import {
  HomeSkeleton, MapSkeleton, PlaceDetailSkeleton, ProfileSkeleton,
  RouteSkeleton, ReviewSkeleton, ReportSkeleton, ForBusinessSkeleton,
  TextPageSkeleton, AdminSkeleton, ScanSkeleton, BusinessRegisterSkeleton,
} from './components/Skeletons'

const Home             = lazy(() => import('./pages/Home'))
const MapPage          = lazy(() => import('./pages/MapPage'))
const PlaceDetail      = lazy(() => import('./pages/PlaceDetail'))
const RoutePlanner     = lazy(() => import('./pages/RoutePlanner'))
const Report           = lazy(() => import('./pages/Report'))
const SubmitReview     = lazy(() => import('./pages/SubmitReview'))
const Profile          = lazy(() => import('./pages/Profile'))
const Admin            = lazy(() => import('./pages/Admin'))
const BusinessRegister = lazy(() => import('./pages/BusinessRegister'))
const Privacy          = lazy(() => import('./pages/Privacy'))
const Terms            = lazy(() => import('./pages/Terms'))
const Councils         = lazy(() => import('./pages/Councils'))
const Security         = lazy(() => import('./pages/Security'))
const Accessibility    = lazy(() => import('./pages/Accessibility'))
const ForBusiness      = lazy(() => import('./pages/ForBusiness'))
const ScanPage         = lazy(() => import('./pages/ScanPage'))

function S({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">This page doesn't exist</h1>
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
      <Routes>
        <Route path="/"               element={<S fallback={<HomeSkeleton />}><Home /></S>} />
        <Route path="/map"            element={<S fallback={<MapSkeleton />}><MapPage /></S>} />
        <Route path="/place/:id"      element={<S fallback={<PlaceDetailSkeleton />}><PlaceDetail /></S>} />
        <Route path="/route"          element={<S fallback={<RouteSkeleton />}><RoutePlanner /></S>} />
        <Route path="/report"         element={<S fallback={<ReportSkeleton />}><Report /></S>} />
        <Route path="/submit-review"  element={<S fallback={<ReviewSkeleton />}><SubmitReview /></S>} />
        <Route path="/scan"           element={<S fallback={<ScanSkeleton />}><ScanPage /></S>} />
        <Route path="/profile"        element={<S fallback={<ProfileSkeleton />}><Profile /></S>} />
        <Route path="/for-business"   element={<S fallback={<ForBusinessSkeleton />}><ForBusiness /></S>} />
        <Route path="/business"       element={<S fallback={<BusinessRegisterSkeleton />}><BusinessRegister /></S>} />
        <Route path="/admin"          element={<S fallback={<AdminSkeleton />}><Admin /></S>} />
        <Route path="/privacy"        element={<S fallback={<TextPageSkeleton />}><Privacy /></S>} />
        <Route path="/terms"          element={<S fallback={<TextPageSkeleton />}><Terms /></S>} />
        <Route path="/accessibility"  element={<S fallback={<TextPageSkeleton />}><Accessibility /></S>} />
        <Route path="/councils"       element={<S fallback={<TextPageSkeleton />}><Councils /></S>} />
        <Route path="/security"       element={<S fallback={<TextPageSkeleton />}><Security /></S>} />
        <Route path="*"               element={<NotFound />} />
      </Routes>
      <AccessibilityPanel />
    </>
  )
}
