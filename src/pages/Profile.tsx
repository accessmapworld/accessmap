import { useEffect, useState } from 'react'
import { LogIn, LogOut, Crown } from 'lucide-react'
import Layout from '../components/Layout'
import PlaceCard from '../components/PlaceCard'
import { useStore } from '../store/useStore'
import { getPlaces, getReviews, getAlerts } from '../lib/data'
import { FIREBASE_ENABLED } from '../lib/firebase'
import type { Place, Review, Alert } from '../types'

export default function Profile() {
  const user = useStore((s) => s.user)
  const signInGoogle = useStore((s) => s.signInGoogle)
  const signInEmail = useStore((s) => s.signInEmail)
  const logout = useStore((s) => s.logout)

  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [name, setName] = useState('')
  const [register, setRegister] = useState(false)
  const [err, setErr] = useState('')

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

  async function submit() {
    setErr('')
    try { await signInEmail(email, pw, name, register) }
    catch (e: any) { setErr(e.message ?? 'Sign-in failed') }
  }

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-sm">
          <h1 className="font-display text-3xl">Sign in</h1>
          {!FIREBASE_ENABLED && (
            <p className="mt-2 text-sm text-muted">Demo mode: any credentials sign you in locally.</p>
          )}
          <button onClick={signInGoogle} className="btn-ghost mt-6 w-full">
            <LogIn size={16} /> Continue with Google
          </button>
          <div className="my-5 flex items-center gap-3 text-muted">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {register && (
              <input className="input" placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
            {err && <p className="text-sm text-alert">{err}</p>}
            <button onClick={submit} className="btn-primary w-full">{register ? 'Create account' : 'Sign in'}</button>
            <button onClick={() => setRegister((r) => !r)} className="w-full text-sm text-muted hover:text-ink">
              {register ? 'Have an account? Sign in' : 'New here? Create an account'}
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const savedPlaces = places.filter((p) => user.savedPlaces.includes(p.id))

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full border border-border" />
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
