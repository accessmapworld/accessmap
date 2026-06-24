import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Loader2, Search, AlertTriangle, Navigation, ExternalLink, LocateFixed, X } from 'lucide-react'
import Layout from '../components/Layout'
import { searchPlaces, reverseGeocode, getWalkingRoute, type GeoResult } from '../lib/nominatim'
import { googleMapsDir } from '../lib/maps'

type Pref = 'stairs' | 'hills' | 'construction' | 'elevators'
const PREFS: { key: Pref; label: string }[] = [
  { key: 'stairs', label: 'Avoid stairs' },
  { key: 'hills', label: 'Avoid steep hills' },
  { key: 'construction', label: 'Avoid construction' },
  { key: 'elevators', label: 'Prefer elevators' },
]

const dot = (color: string) =>
  L.divIcon({
    className: 'am-dot',
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3),0 0 0 2px ${color}"></span>`,
    iconSize: [16, 16], iconAnchor: [8, 8],
  })

function GeoInput({ label, value, color, onPick, onClear }: {
  label: string; value?: GeoResult; color: string
  onPick: (g: GeoResult) => void; onClear: () => void
}) {
  const [q, setQ] = useState(value?.shortName ?? '')
  const [results, setResults] = useState<GeoResult[]>([])
  const [busy, setBusy] = useState(false)
  const [geoBusy, setGeoBusy] = useState(false)
  const [err, setErr] = useState('')

  // keep the text field in sync when the value is set from outside (locate / map click)
  useEffect(() => { setQ(value?.shortName ?? '') }, [value?.shortName])

  useEffect(() => {
    if (q.trim().length < 3 || q === value?.shortName) { setResults([]); return }
    const t = setTimeout(async () => {
      setBusy(true)
      try { setResults(await searchPlaces(q)) } finally { setBusy(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [q, value?.shortName])

  function useMyLocation() {
    setErr('')
    if (!navigator.geolocation || !window.isSecureContext) {
      setErr('Location needs a secure (https/localhost) connection.'); return
    }
    setGeoBusy(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const g = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        g.shortName = 'My location'
        onPick(g); setQ('My location'); setResults([]); setGeoBusy(false)
      },
      () => { setGeoBusy(false); setErr('Location blocked — allow it in your browser, or type an address.') },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="relative">
      <span className="label">{label}</span>
      <div className="card mt-1 flex items-center gap-2 px-3 py-2">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
        <input
          className="w-full bg-transparent outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type an address, or use the buttons →"
          aria-label={label}
        />
        {busy && <Loader2 size={14} className="animate-spin text-primary" aria-label="Searching" />}
        {q && !busy && (
          <button onClick={() => { setQ(''); setResults([]); onClear() }} className="rounded-full p-1 text-muted hover:bg-bg hover:text-ink" title="Clear" aria-label={`Clear ${label}`}><X size={14} /></button>
        )}
        <span className="h-5 w-px bg-border" />
        <button onClick={useMyLocation} title="Use my location"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10">
          {geoBusy ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
        </button>
      </div>
      {err && <p className="mt-1 text-xs text-alert">{err}</p>}
      {results.length > 0 && (
        <div className="card absolute z-20 mt-1 max-h-64 w-full overflow-y-auto">
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
  const [hint, setHint] = useState('Tip: tap “Use my location”, search an address, or click the map.')

  // refs so the Leaflet click handler always sees the latest state
  const startRef = useRef<GeoResult>(); startRef.current = start
  const endRef = useRef<GeoResult>(); endRef.current = end

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, { attributionControl: false }).setView([41.88, -87.63], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 100)

    // click the map to set start, then destination
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const g = await reverseGeocode(e.latlng.lat, e.latlng.lng)
      if (!startRef.current) { setStart(g); setHint('Start set — now pick a destination.') }
      else if (!endRef.current) { setEnd(g); setHint('Destination set — press Plan route.') }
      else { setEnd(g) }
    })

    // prompt for location and prefill Start
    if (navigator.geolocation && window.isSecureContext) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const g = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        g.shortName = 'My location'
        setStart((prev) => prev ?? g)
      }, () => {}, { enableHighAccuracy: true, timeout: 8000 })
    }

    return () => { map.remove(); mapRef.current = null }
  }, [])

  // draw / update endpoint markers when start or end change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (lineRef.current) return // don't fight the planned-route markers
    markersRef.current.forEach((m) => m.remove()); markersRef.current = []
    if (start) markersRef.current.push(L.marker([start.lat, start.lng], { icon: dot('#0ABFBF') }).addTo(map).bindTooltip('Start'))
    if (end) markersRef.current.push(L.marker([end.lat, end.lng], { icon: dot('#FF6B47') }).addTo(map).bindTooltip('Destination'))
    if (start && end) map.fitBounds(L.latLngBounds([[start.lat, start.lng], [end.lat, end.lng]]), { padding: [60, 60] })
    else if (start) map.setView([start.lat, start.lng], 14)
    else if (end) map.setView([end.lat, end.lng], 14)
  }, [start, end])

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
      markersRef.current = [
        L.marker([start.lat, start.lng], { icon: dot('#0ABFBF') }).addTo(mapRef.current).bindTooltip('Start'),
        L.marker([end.lat, end.lng], { icon: dot('#FF6B47') }).addTo(mapRef.current).bindTooltip('Destination'),
      ]
      mapRef.current.fitBounds(line.getBounds(), { padding: [40, 40] })
      setSteps(steps)
      setMeta({ km: distance / 1000, min: Math.round(duration / 60) })
    } catch {
      setErr('Could not find a walking route between those points.')
    } finally { setBusy(false) }
  }

  function reset() {
    lineRef.current?.remove(); lineRef.current = null
    markersRef.current.forEach((m) => m.remove()); markersRef.current = []
    setStart(undefined); setEnd(undefined); setSteps([]); setMeta(null); setErr('')
    setHint('Tip: tap “Use my location”, search an address, or click the map.')
  }

  const warn = (s: string) => /stair|step|escalator/i.test(s)

  return (
    <Layout>
      <h1 className="text-3xl font-semibold">Accessible route planner</h1>
      <p className="mt-1 text-muted">Step-free walking directions with accessibility warnings flagged.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <GeoInput label="Start" value={start} color="#0ABFBF" onPick={setStart} onClear={() => setStart(undefined)} />
          <GeoInput label="Destination" value={end} color="#FF6B47" onPick={setEnd} onClear={() => setEnd(undefined)} />

          <p className="text-xs text-muted">{hint}</p>

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
              target="_blank" rel="noreferrer"
              aria-disabled={!start || !end}
              className={`gmaps-btn flex-1 ${!start || !end ? 'pointer-events-none opacity-50' : ''}`}
            >
              <ExternalLink size={16} /> Google Maps
            </a>
          </div>
          {(start || end) && <button onClick={reset} className="text-sm text-muted hover:text-ink">Reset</button>}
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

        <div ref={elRef} className="h-[520px] cursor-crosshair overflow-hidden rounded-2xl border border-border" />
      </div>
    </Layout>
  )
}
