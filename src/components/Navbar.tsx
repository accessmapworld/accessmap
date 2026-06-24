import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Route as RouteIcon, Flag, Star, User, ShieldCheck, Megaphone, Map as MapIcon, Accessibility, UserCog } from 'lucide-react'
import MapPin from './MapPin'
import { useStore } from '../store/useStore'
import { hasProfile } from '../lib/compatibility'
import NeedsSetup from './NeedsSetup'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 ${
    isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-bg hover:text-ink'
  }`

export default function Navbar() {
  const user = useStore((s) => s.user)
  const easyMode = useStore((s) => s.easyMode)
  const toggleEasyMode = useStore((s) => s.toggleEasyMode)
  const needsProfile = useStore((s) => s.needsProfile)
  const [showNeeds, setShowNeeds] = useState(false)
  const profileSet = hasProfile(needsProfile)

  const links = [
    { to: '/map', label: 'Map', icon: MapIcon },
    { to: '/route', label: 'Route', icon: RouteIcon },
    { to: '/report', label: 'Report', icon: Flag },
    { to: '/submit-review', label: 'Review', icon: Star },
  ]

  return (
    <>
      {/* Skip-to-content for keyboard/screen reader users */}
      <a href="#main-content" className="skip-nav">Skip to main content</a>

      <header className="fixed inset-x-0 top-0 z-[900] border-b border-border bg-card/90 shadow-[0_1px_3px_rgba(60,64,67,0.12)] backdrop-blur">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4"
          aria-label="Main navigation"
        >
          <Link to="/" className="flex items-center gap-2" aria-label="AccessMap home">
            <MapPin size={34} pulse={false} />
            <span className="text-xl font-semibold tracking-tight">
              Access<span className="text-primary">Map</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <NavLink to="/business" className={({ isActive }) =>
              `mr-1 hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 sm:flex ${
                isActive ? 'bg-primary text-white' : 'border border-primary/30 text-primary hover:bg-primary/10'
              }`
            }>
              <Megaphone size={16} /> For Business
            </NavLink>

            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navCls} aria-label={label}>
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navCls} aria-label="Admin">
                <ShieldCheck size={16} />
                <span className="hidden sm:inline">Admin</span>
              </NavLink>
            )}

            {/* My Needs profile */}
            <button
              onClick={() => setShowNeeds(true)}
              aria-label={profileSet ? 'Edit your accessibility needs profile' : 'Set up your accessibility needs'}
              title={profileSet ? 'Your accessibility profile is set' : 'Tell us your accessibility needs for personalised scores'}
              className={`ml-1 flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                profileSet
                  ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                  : 'border border-dashed border-primary/50 text-primary hover:bg-primary/5'
              }`}
            >
              <UserCog size={16} aria-hidden="true" />
              <span className="hidden sm:inline">
                {profileSet
                  ? (needsProfile.name ? `${needsProfile.name.split(' ')[0]}'s needs ✓` : 'My Needs ✓')
                  : 'My Needs'}
              </span>
            </button>

            {/* Accessibility Mode toggle */}
            <button
              onClick={toggleEasyMode}
              aria-pressed={easyMode}
              aria-label={easyMode ? 'Turn off accessibility mode' : 'Turn on accessibility mode'}
              title={easyMode ? 'Accessibility mode on — click to turn off' : 'Accessibility mode'}
              className={`ml-1 flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                easyMode
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-border text-muted hover:bg-bg hover:text-ink'
              }`}
            >
              <Accessibility size={16} aria-hidden="true" />
              <span className="hidden sm:inline">{easyMode ? 'Accessibility Mode On' : 'Accessibility Mode'}</span>
            </button>

            <NavLink to="/profile" className="ml-1.5" aria-label="Your profile">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="h-9 w-9 rounded-full border border-border" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg text-muted transition-colors hover:text-ink">
                  <User size={18} aria-hidden="true" />
                </span>
              )}
            </NavLink>
          </div>
        </nav>

        {/* Accessibility mode banner */}
        {easyMode && (
          <div
            role="status"
            aria-live="polite"
            className="border-t-2 border-[#0057a8] bg-[#0057a8] px-4 py-2 text-center text-sm font-semibold text-white"
          >
            Accessibility mode is on — larger text, high contrast, reduced motion, bigger tap targets
          </div>
        )}
      </header>

      {showNeeds && <NeedsSetup onClose={() => setShowNeeds(false)} />}
    </>
  )
}
