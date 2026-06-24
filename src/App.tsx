import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import PlaceDetail from './pages/PlaceDetail'
import RoutePlanner from './pages/RoutePlanner'
import Report from './pages/Report'
import SubmitReview from './pages/SubmitReview'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import BusinessRegister from './pages/BusinessRegister'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Councils from './pages/Councils'
import Security from './pages/Security'
import AccessibilityPanel from './components/AccessibilityPanel'

export default function App() {
  const initAuth = useStore((s) => s.initAuth)
  useEffect(() => { initAuth() }, [initAuth])

  return (
    <>
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
      </Routes>
      <AccessibilityPanel />
    </>
  )
}
