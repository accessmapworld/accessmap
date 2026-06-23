import { Link, NavLink } from 'react-router-dom'
import { Route as RouteIcon, Flag, Star, User, ShieldCheck, Megaphone, Map as MapIcon } from 'lucide-react'
import MapPin from './MapPin'
import { useStore } from '../store/useStore'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 ${
    isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-bg hover:text-ink'
  }`

export default function Navbar() {
  const user = useStore((s) => s.user)
  const links = [
    { to: '/map', label: 'Map', icon: MapIcon },
    { to: '/route', label: 'Route', icon: RouteIcon },
    { to: '/report', label: 'Report', icon: Flag },
    { to: '/submit-review', label: 'Review', icon: Star },
  ]
  return (
    <header className="fixed inset-x-0 top-0 z-[900] border-b border-border bg-card/90 shadow-[0_1px_3px_rgba(60,64,67,0.12)] backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
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
            <NavLink key={to} to={to} className={navCls}>
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navCls}>
              <ShieldCheck size={16} />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          )}
          <NavLink to="/profile" className="ml-1.5">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full border border-border" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg text-muted transition-colors hover:text-ink">
                <User size={18} />
              </span>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  )
}
