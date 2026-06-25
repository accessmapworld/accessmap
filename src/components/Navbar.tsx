import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Route as RouteIcon, Flag, Star, User, ShieldCheck, Map as MapIcon, Accessibility, UserCog, LogIn } from 'lucide-react'
import MapPin from './MapPin'
import { useStore } from '../store/useStore'
import { hasProfile } from '../lib/compatibility'
import NeedsSetup from './NeedsSetup'
import AuthModal from './AuthModal'

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
  const [showAuth, setShowAuth] = useState(false)
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

      <header className="fixed inset-x-0 top-0 z-[900] bg-white/95 backdrop-blur-md border-b border-[#f1f3f4]" style={{ boxShadow: '0 1px 0 #e8eaed, 0 2px 8px rgba(60,64,67,0.08)' }}>
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-2.5" aria-label="AccessMap home">
            <MapPin size={30} pulse={false} />
            <span className="text-[17px] font-bold tracking-tight text-[#202124]">
              Access<span className="text-primary">Map</span>
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navCls} aria-label={label}>
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navCls} aria-label="Admin">
                <ShieldCheck size={15} />
                <span className="hidden sm:inline">Admin</span>
              </NavLink>
            )}

            <button
              onClick={() => setShowNeeds(true)}
              aria-label={profileSet ? 'Edit your accessibility needs' : 'Set your accessibility needs'}
              className={`ml-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                profileSet
                  ? 'bg-[#e6f4ea] text-[#1a7337] hover:bg-[#ceead6]'
                  : 'border border-dashed border-primary/40 text-primary hover:bg-primary/5'
              }`}
            >
              <UserCog size={15} />
              <span className="hidden sm:inline">{profileSet ? (needsProfile.name ? `${needsProfile.name.split(' ')[0]} ✓` : 'My Needs ✓') : 'My Needs'}</span>
            </button>

            <button
              onClick={toggleEasyMode}
              aria-pressed={easyMode}
              aria-label={easyMode ? 'Turn off accessibility mode' : 'Turn on accessibility mode'}
              className={`ml-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                easyMode ? 'bg-primary text-white' : 'border border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa]'
              }`}
            >
              <Accessibility size={15} />
              <span className="hidden sm:inline">{easyMode ? 'Accessibility On' : 'Accessibility'}</span>
            </button>

            {user ? (
              <NavLink to="/profile" className="ml-2" aria-label={`Your profile — ${user.displayName}`}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full border-2 border-[#e8eaed]" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dadce0] bg-[#f8f9fa] text-[#5f6368] hover:bg-[#f1f3f4]">
                    <User size={16} aria-hidden="true" />
                  </span>
                )}
              </NavLink>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="ml-2 flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-[13px] font-medium text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Sign in"
              >
                <LogIn size={14} aria-hidden="true" />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}
          </div>
        </nav>

        {easyMode && (
          <div role="status" aria-live="polite" className="bg-primary px-4 py-1.5 text-center text-[13px] font-semibold text-white">
            Accessibility mode on — larger text, high contrast, bigger tap targets
          </div>
        )}
      </header>

      {showNeeds && <NeedsSetup onClose={() => setShowNeeds(false)} />}
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  )
}
