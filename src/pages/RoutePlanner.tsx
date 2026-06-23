import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Loader2, Search, AlertTriangle, Navigation, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'
import { searchPlaces, getWalkingRoute, type GeoResult } from '../lib/nominatim'
import { googleMapsDir } from '../lib/maps'

type Pref = 'stairs' | 'hills' | 'construction' | 'elevators'
const PREFS: { key: Pref; label: string }[] = [
  { key: 'stairs', label: 'Avoid stairs' },
  { key: 'hills', label: 'Avoid steep hills' },
  { key: 'construction', label: 'Avoid construction' },
  { key: 'elevators', label: 'Prefer elevators' },
]

function GeoInput({ label, value, onPick }: { label: string; value?: GeoResult; onPick: (g: GeoResult) => void }) {
  const [q, setQ] = useState(value?.shortName ?? '')
  const [results, setResults] = useState<GeoResult[]>([])
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (q.trim().length < 3) { setResults([]); return }
    const t = setTimeout(async () => {
      setBusy(true)
      try { setResults(await searchPlaces(q)) } finally { setBusy(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [q])
  return (
    <div className="relative">
      <span className="label">{label}</span>
      <div className="card mt-1 flex items-center gap-2 px-3 py-2">
        <Search size={16} className="text-muted" />
        <input className="w-full bg-transparent outline-none" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search address…" />
        {busy && <Loader2 size={14} className="animate-spin text-primary" />}
      </div>
      {results.length > 0 && (
        <div className="card absolute z-10 mt-1 w-full overflow-hidden">
          {results.map((r, i) => (
            <button key={i} onClick={() => { onPick(r); setQ(r.shortName); setResults([]) }}
              className="block w-full border-b border-border px-3 py-2 text-left text-sm last:border-0 hover:bg-bg">
              <p>{r.shortName}</p>
              <p className="truncate text-xs text-muted">{r.displayName}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoutePlanner() {
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const lineRef = useRef<L.Polyline | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [start, setStart] = useState<GeoResult>()
  const [end, setEnd] = useState<GeoResult>()
  const [prefs, setPrefs] = useState<Set<Pref>>(new Set(['stairs', 'elevators']))
  const [steps, setSteps] = useState<string[]>([])
  const [meta, setMeta] = useState<{ km: number; min: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, { attributionControl: false }).setView([41.88, -87.63], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 100)
    return () => { map.remove(); mapRef.current = null }
  }, [])

  function togglePref(p: Pref) {
    setPrefs((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n })
  }

  async function plan() {
    if (!start || !end || !mapRef.current) return
    setBusy(true); setErr('')
    try {
      const { coords, distance, duration, steps } = await getWalkingRoute([start.lat, start.lng], [end.lat, end.lng])
      lineRef.current?.remove()
      markersRef.current.forEach((m) => m.remove())
      const line = L.polyline(coords, { color: '#0ABFBF', weight: 5, opacity: 0.9 }).addTo(mapRef.current)
      lineRef.current = line
      const dot = (color: string) =>
        L.divIcon({
          className: 'am-dot',
          html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3),0 0 0 2px ${color}"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
      markersRef.current = [
        L.marker([start.lat, start.lng], { icon: dot('#0ABFBF') }).addTo(mapRef.current).bindTooltip('Start'),
        L.marker([end.lat, end.lng], { icon: dot('#FF6B47') }).addTo(mapRef.current).bindTooltip('Destination'),
      ]
      mapRef.current.fitBounds(line.getBounds(), { padding: [40, 40] })
      setSteps(steps)
      setMeta({ km: distance / 1000, min: Math.round(duration / 60) })
    } catch (e: any) {
      setErr('Could not find a walking route between those points.')
    } finally { setBusy(false) }
  }

  // flag steps that mention stairs / steps as accessibility warnings
  const warn = (s: string) => /stair|step|escalator/i.test(s)

  return (
    <Layout>
      <h1 className="font-display text-3xl">Accessible route planner</h1>
      <p className="mt-1 text-muted">Step-free walking directions with accessibility warnings flagged.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <GeoInput label="Start" value={start} onPick={setStart} />
          <GeoInput label="Destination" value={end} onPick={setEnd} />

          <div className="flex flex-wrap gap-2">
            {PREFS.map((p) => (
              <button key={p.key} onClick={() => togglePref(p.key)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
                  prefs.has(p.key) ? 'border-primary bg-primary text-white' : 'border-border bg-card text-muted hover:text-ink'
                }`}>{p.label}</button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={plan} disabled={!start || !end || busy} className="btn-primary flex-1 disabled:opacity-50">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />} Plan route
            </button>
            <a
              href={start && end ? googleMapsDir([start.lat, start.lng], [end.lat, end.lng]) : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!start || !end}
              className={`gmaps-btn flex-1 ${!start || !end ? 'pointer-events-none opacity-50' : ''}`}
            >
              <ExternalLink size={16} /> Google Maps
            </a>
          </div>
          {err && <p className="text-sm text-alert">{err}</p>}

          {meta && (
            <div className="card p-4">
              <p className="label">{meta.km.toFixed(1)} km · ~{meta.min} min walking</p>
              <ol className="mt-3 space-y-2">
                {steps.map((s, i) => (
                  <li key={i} className={`flex gap-2 text-sm ${warn(s) ? 'text-alert' : 'text-ink/90'}`}>
                    {warn(s) ? <AlertTriangle size={15} className="mt-0.5 shrink-0" /> : <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <span>{s}{warn(s) && ' — accessibility warning'}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div ref={elRef} className="h-[520px] overflow-hidden rounded-2xl border border-border" />
      </div>
    </Layout>
  )
}
