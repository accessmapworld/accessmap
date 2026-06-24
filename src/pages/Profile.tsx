import { useEffect, useState } from 'react'
import { LogOut, Crown } from 'lucide-react'
import Layout from '../components/Layout'
import PlaceCard from '../components/PlaceCard'
import AuthModal from '../components/AuthModal'
import { useStore } from '../store/useStore'
import { getPlaces, getReviews, getAlerts } from '../lib/data'
import type { Place, Review, Alert } from '../types'

export default function Profile() {
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const [showAuth, setShowAuth] = useState(false)

  const [places, setPlaces] = useState<Place[]>([])
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [myReports, setMyReports] = useState<Alert[]>([])

  useEffect(() => {
    if (!user) return
    getPlaces().then(async (ps) => {
      setPlaces(ps)
      const reviews = (await Promise.all(ps.map((p) => getReviews(p.id)))).flat()
      setMyReviews(reviews.filter((r) => r.userId === user.uid || r.userName === user.displayName))
      const alerts = await getAlerts(undefined, false)
      setMyReports(alerts.filter((a) => a.reportedBy === user.displayName))
    })
  }, [user])

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-sm py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f9fa] border border-border">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="10" r="5" fill="#dadce0"/>
              <path d="M4 26c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#dadce0"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-ink">Sign in to AccessMap</h1>
          <p className="mt-2 text-muted text-sm">Save places, write reviews, and track your contributions.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="btn-primary mt-6 px-7 py-3 text-base"
          >
            Sign in
          </button>
        </div>
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </Layout>
    )
  }

  const savedPlaces = places.filter((p) => user.savedPlaces.includes(p.id))

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img src={user.photoURL} alt={`${user.displayName}'s profile photo`} className="h-16 w-16 rounded-full border border-border" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-2xl font-semibold text-primary">
              {user.displayName.charAt(0)}
            </span>
          )}
          <div>
            <h1 className="font-display text-2xl">
              {user.displayName}
              {user.premium && <Crown className="ml-2 inline text-yellow-400" size={18} />}
            </h1>
            <p className="text-sm text-muted">{user.email} · {user.role}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost"><LogOut size={16} /> Sign out</button>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="font-display text-xl">Saved places</h2>
          <div className="mt-3 space-y-3">
            {savedPlaces.length === 0 && <p className="text-muted">No saved places yet.</p>}
            {savedPlaces.map((p) => <PlaceCard key={p.id} place={p} />)}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl">My reports</h2>
          <div className="mt-3 space-y-2">
            {myReports.length === 0 && <p className="text-muted">No reports submitted.</p>}
            {myReports.map((a) => (
              <div key={a.id} className="card flex items-center justify-between p-3 text-sm">
                <span className="truncate">{a.description}</span>
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  a.status === 'resolved' ? 'bg-green-500/15 text-green-400'
                  : a.aiVerified ? 'bg-primary/15 text-primary' : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {a.status === 'resolved' ? 'resolved' : a.aiVerified ? 'verified' : 'pending'}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-6 font-display text-xl">My reviews</h2>
          <div className="mt-3 space-y-2">
            {myReviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
            {myReviews.map((r) => (
              <div key={r.id} className="card p-3 text-sm">
                <p className="truncate text-muted">{places.find((p) => p.id === r.placeId)?.name}</p>
                <p>{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
