import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Search, Megaphone, BadgeCheck, Star } from 'lucide-react'
import Layout from '../components/Layout'
import { scoreColor } from '../components/ScoreRing'
import { addPlace } from '../lib/data'
import { searchPlaces, type GeoResult } from '../lib/nominatim'
import { useStore } from '../store/useStore'
import type { Dimension, Scores } from '../types'

const DIMS: { key: Dimension; label: string }[] = [
  { key: 'mobility', label: 'Mobility' },
  { key: 'sensory', label: 'Sensory' },
  { key: 'hearing', label: 'Hearing' },
  { key: 'vision', label: 'Vision' },
]

const FEATURES = [
  'Step-free entrance', 'Wheelchair ramp', 'Elevator', 'Accessible bathroom',
  'Automatic doors', 'Accessible parking', 'Braille signage', 'Tactile paths',
  'Hearing loop', 'Sign-language staff', 'Quiet space', 'Service-animal friendly',
]

const CATEGORIES = ['Restaurant', 'Cafe', 'Hotel', 'Retail / Shop', 'Clinic / Pharmacy', 'Gym / Fitness', 'Office', 'Other']

export default function BusinessRegister() {
  const nav = useNavigate()
  const user = useStore((s) => s.user)

  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [contact, setContact] = useState('')
  const [geo, setGeo] = useState<GeoResult>()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)
  const [features, setFeatures] = useState<Set<string>>(new Set())
  const [scores, setScores] = useState<Scores>({ mobility: 7, sensory: 6, hearing: 6, vision: 6 })
  const [sponsored, setSponsored] = useState(true)
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState<string | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (q.trim().length < 3) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try { setResults(await searchPlaces(q)) } finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [q])

  function toggleFeature(f: string) {
    setFeatures((s) => { const n = new Set(s); n.has(f) ? n.delete(f) : n.add(f); return n })
  }

  const valid = name.trim().length >= 2 && geo

  async function submit() {
    if (!valid || !geo) return
    setBusy(true); setErr('')
    try {
      const place = await addPlace({
        name: name.trim(),
        address: geo.displayName.split(',').slice(0, 3).join(',').trim(),
        lat: geo.lat,
        lng: geo.lng,
        scores,
        category,
        contact: contact.trim() || undefined,
        features: [...features],
        sponsored,
        selfListed: true,
        osmId: geo.osmId,
      })
      setCreated(place.id)
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (created) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg text-center">
          <BadgeCheck className="mx-auto text-primary" size={48} />
          <h1 className="mt-3 text-2xl font-semibold">You’re on the map! 🎉</h1>
          <p className="mt-1 text-muted">
            {name} is now listed as a disability-friendly business
            {sponsored && ' with a featured ★ Sponsored badge'}.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => nav(`/place/${created}`)} className="btn-primary">View my listing</button>
            <button onClick={() => nav('/')} className="btn-ghost">Back to map</button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Megaphone size={24} /></span>
          <div>
            <h1 className="text-3xl font-semibold">List your business</h1>
            <p className="text-muted">Get discovered as disability-friendly — advertise to a community that values access.</p>
          </div>
        </div>

        {/* Value props */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { t: 'Reach loyal customers', d: 'Disabled travelers and their families plan around accessibility.' },
            { t: 'Featured placement', d: 'Sponsored listings show a gold ★ pin and rank first in results.' },
            { t: 'Verified trust badge', d: 'A “Disability-friendly business” badge on your profile.' },
          ].map((c) => (
            <div key={c.t} className="card p-4">
              <p className="font-medium">{c.t}</p>
              <p className="mt-1 text-sm text-muted">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="card mt-6 space-y-5 p-6">
          <label className="block">
            <span className="label">Business name</span>
            <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riverside Bistro" />
          </label>

          <div className="relative">
            <span className="label">Address / location</span>
            <div className="input mt-1 flex items-center gap-2">
              <Search size={16} className="text-muted" />
              <input className="w-full bg-transparent outline-none" value={geo ? geo.shortName : q}
                onChange={(e) => { setQ(e.target.value); setGeo(undefined) }} placeholder="Search your address…" />
              {searching && <Loader2 size={14} className="animate-spin text-primary" />}
            </div>
            {!geo && results.length > 0 && (
              <div className="card absolute z-10 mt-1 w-full overflow-hidden">
                {results.map((r, i) => (
                  <button key={i} onClick={() => { setGeo(r); setResults([]); setQ(r.shortName) }}
                    className="block w-full border-b border-border px-3 py-2 text-left text-sm last:border-0 hover:bg-bg">
                    <p>{r.shortName}</p><p className="truncate text-xs text-muted">{r.displayName}</p>
                  </button>
                ))}
              </div>
            )}
            {geo && <p className="label mt-1 text-primary">✓ pinned at {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Category</span>
              <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Contact (optional)</span>
              <input className="input mt-1" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="email or phone" />
            </label>
          </div>

          <div>
            <span className="label">Accessibility features</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <button key={f} onClick={() => toggleFeature(f)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
                    features.has(f) ? 'border-primary bg-primary text-white' : 'border-border bg-card text-muted hover:text-ink'
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Self-reported scores</span>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {DIMS.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-mono" style={{ color: scoreColor(scores[key]) }}>{scores[key]}/10</span>
                  </div>
                  <input type="range" min={0} max={10} value={scores[key]}
                    onChange={(e) => setScores((s) => ({ ...s, [key]: Number(e.target.value) }))}
                    className="w-full accent-[#1a73e8]" />
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Star size={16} className="text-[#f5b50a]" /> Featured / Sponsored listing
              <span className="label">gold ★ pin + top ranking</span>
            </span>
            <button onClick={() => setSponsored((s) => !s)}
              className={`relative h-6 w-11 rounded-full transition-colors ${sponsored ? 'bg-primary' : 'bg-border'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${sponsored ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>

          {err && <p className="text-sm text-alert">{err}</p>}
          <button disabled={!valid || busy} onClick={submit} className="btn-primary w-full disabled:opacity-50">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Megaphone size={16} />}
            {sponsored ? 'Publish sponsored listing' : 'Publish free listing'}
          </button>
          {!user && <p className="text-center text-xs text-muted">Tip: sign in first so you can edit this listing later.</p>}
        </div>
      </div>
    </Layout>
  )
}
