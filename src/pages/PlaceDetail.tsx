import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin as MapPinIcon, Flag, Star, Route as RouteIcon, ShieldCheck, ShieldAlert, Bookmark, ExternalLink, BadgeCheck } from 'lucide-react'
import { googleMapsTo } from '../lib/maps'
import Layout from '../components/Layout'
import ScoreRing from '../components/ScoreRing'
import AlertBanner from '../components/AlertBanner'
import Modal from '../components/Modal'
import ReportForm from '../components/ReportForm'
import ReviewForm from '../components/ReviewForm'
import { getPlace, getReviews, getAlerts, resolveAlert } from '../lib/data'
import { useStore } from '../store/useStore'
import { scorePlace, hasProfile } from '../lib/compatibility'
import MatchBadge from '../components/MatchBadge'
import type { Place, Review, Alert } from '../types'

function timeAgo(ms: number) {
  const d = Math.floor((Date.now() - ms) / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

export default function PlaceDetail() {
  const { id = '' } = useParams()
  const [place, setPlace] = useState<Place | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showReport, setShowReport] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const user = useStore((s) => s.user)
  const toggleSaved = useStore((s) => s.toggleSaved)
  const needsProfile = useStore((s) => s.needsProfile)
  const saved = user?.savedPlaces.includes(id)

  async function load() {
    setPlace(await getPlace(id))
    setReviews(await getReviews(id))
    setAlerts(await getAlerts(id))
  }
  useEffect(() => { load() }, [id])

  async function onResolve(alertId: string) {
    await resolveAlert(alertId)
    setAlerts(await getAlerts(id))
  }

  if (!place) return <Layout><p className="text-muted">Loading place…</p></Layout>

  const photos = reviews.flatMap((r) => r.photos.map((url) => ({ url, verified: r.verified })))

  return (
    <Layout>
      {alerts.map((a) => (
        <div key={a.id} className="mb-3"><AlertBanner alert={a} onResolve={onResolve} /></div>
      ))}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {(() => {
            const avg = (place.scores.mobility + place.scores.sensory + place.scores.hearing + place.scores.vision) / 4
            const color = avg >= 8 ? '#1e8e3e' : avg >= 5 ? '#f29900' : '#ea4335'
            return (
              <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-lift" style={{ background: color }}>
                <span className="text-2xl font-bold leading-none">{avg.toFixed(1)}</span>
                <span className="text-[10px] font-medium uppercase tracking-wide opacity-90">/ 10</span>
              </span>
            )
          })()}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold">{place.name}</h1>
              {place.sponsored && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f5b50a]/15 px-2.5 py-1 text-xs font-semibold text-[#b9870a]">
                  <Star size={13} className="fill-[#f5b50a] text-[#f5b50a]" /> Sponsored
                </span>
              )}
              {place.selfListed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <BadgeCheck size={13} /> Disability-friendly business
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-muted">
              <MapPinIcon size={15} /> {place.address}
            </p>
            {place.features && place.features.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {place.features.map((f) => (
                  <span key={f} className="rounded-full border border-border bg-bg px-2.5 py-0.5 text-xs text-muted">{f}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {user && (
          <button onClick={() => toggleSaved(id)} className="btn-ghost text-sm">
            <Bookmark size={16} className={saved ? 'fill-primary text-primary' : ''} />
            {saved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>

      {/* Personal match card — shown only when profile is set */}
      {hasProfile(needsProfile) && (() => {
        const match = scorePlace(place, needsProfile)
        return (
          <section className="mt-6" aria-label="Your personal accessibility match">
            <h2 className="label mb-3">Your personal match</h2>
            <MatchBadge result={match} size="md" />
          </section>
        )
      })()}

      {/* Score card */}
      <section className="card mt-6 p-6">
        <h2 className="label mb-4">Accessibility score</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <ScoreRing score={place.scores.mobility} label="Mobility" />
          <ScoreRing score={place.scores.sensory} label="Sensory" />
          <ScoreRing score={place.scores.hearing} label="Hearing" />
          <ScoreRing score={place.scores.vision} label="Vision" />
        </div>
        {(place.terrainRating || place.trailDifficulty) && (
          <div className="mt-5 border-t border-border pt-5">
            <h3 className="label mb-3">Terrain & Trail</h3>
            <div className="flex flex-wrap gap-3">
              {place.terrainRating && (() => {
                const labels = ['', 'Flat / Paved', 'Mostly Flat', 'Some Slopes', 'Hilly', 'Steep / Rough']
                const colors = ['', '#1e8e3e', '#3d8b40', '#f29900', '#e67c00', '#ea4335']
                return (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted">Terrain</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-white"
                      style={{ background: colors[place.terrainRating] }}>
                      {labels[place.terrainRating]}
                    </span>
                  </div>
                )
              })()}
              {place.trailDifficulty && (() => {
                const colors: Record<string, string> = { easy: '#1e8e3e', moderate: '#f29900', hard: '#e67c00', expert: '#ea4335' }
                return (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted">Trail difficulty</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium capitalize text-white"
                      style={{ background: colors[place.trailDifficulty] }}>
                      {place.trailDifficulty}
                    </span>
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => setShowReview(true)} className="btn-primary"><Star size={16} /> Submit a review</button>
        <button onClick={() => setShowReport(true)} className="btn-alert"><Flag size={16} /> Report an issue</button>
        <Link to="/route" className="btn-ghost"><RouteIcon size={16} /> Accessible route</Link>
        <a
          href={googleMapsTo([place.lat, place.lng])}
          target="_blank"
          rel="noreferrer"
          className="gmaps-btn"
        >
          <ExternalLink size={16} /> Open in Google Maps
        </a>
      </div>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl">Community photos</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((p, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl border border-border">
                <img src={p.url} alt="" className="aspect-square w-full object-cover" />
                <span className={`absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${p.verified ? 'bg-green-600 text-white' : 'bg-alert text-white'}`}>
                  {p.verified ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                  {p.verified ? 'Verified by AI' : 'Unverified'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-8">
        <h2 className="font-display text-xl">Community reviews ({reviews.length})</h2>
        <div className="mt-3 space-y-3">
          {reviews.length === 0 && <p className="text-muted">No reviews yet — be the first.</p>}
          {reviews.map((r, i) => (
            <article
              key={r.id}
              className="card p-4"
              style={{ animation: 'pageIn 380ms ease-out both', animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                  {r.userName.charAt(0)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.userName}</p>
                  <p className="label">{timeAgo(r.createdAt)}{r.verified && ' · photo verified'}</p>
                </div>
                <div className="flex gap-2 font-mono text-xs text-muted">
                  <span>M{r.scores.mobility}</span><span>S{r.scores.sensory}</span>
                  <span>H{r.scores.hearing}</span><span>V{r.scores.vision}</span>
                </div>
              </div>
              <p className="mt-2.5 text-sm text-ink/90">{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      <Modal open={showReport} onClose={() => setShowReport(false)} title="Report an issue">
        <ReportForm placeId={id} onDone={() => { setShowReport(false); load() }} />
      </Modal>
      <Modal open={showReview} onClose={() => setShowReview(false)} title="Submit a review">
        <ReviewForm placeId={id} onDone={() => { setShowReview(false); load() }} />
      </Modal>
    </Layout>
  )
}
