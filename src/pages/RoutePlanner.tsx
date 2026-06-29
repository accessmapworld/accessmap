import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  Loader2, AlertTriangle, Navigation, ExternalLink, LocateFixed, X,
  Accessibility, MapPin, Flag, ArrowUp, CornerUpRight, CornerUpLeft,
  CornerDownRight, ArrowRightLeft, GitFork, Merge, Clock, Route, RotateCcw,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import Layout from '../components/Layout'
import { searchPlaces, reverseGeocode, getWalkingRoute, getWheelchairRoute, type GeoResult } from '../lib/nominatim'
import { googleMapsDir } from '../lib/maps'

const dot = (color: string) =>
  L.divIcon({
    className: 'am-dot',
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,0.25),0 0 0 2px ${color}40"></span>`,
    iconSize: [14, 14], iconAnchor: [7, 7],
  })

// Parse "verb on Road Name — 500 m" into parts
function parseStep(s: string): { verb: string; road: string; dist: string } {
  const [main = '', distPart = ''] = s.split(' — ')
  const m = main.match(/^(.+?) on (.+)$/)
  return { verb: m?.[1] ?? main, road: m?.[2] ?? '', dist: distPart }
}

function StepIcon({ verb }: { verb: string }) {
  const v = verb.toLowerCase()
  const cls = 'shrink-0'
  if (/depart|start/i.test(v)) return <MapPin size={14} className={cls} />
  if (/arrive/i.test(v)) return <Flag size={14} className={cls} />
  if (/turn right/i.test(v)) return <CornerUpRight size={14} className={cls} />
  if (/turn left/i.test(v)) return <CornerUpLeft size={14} className={cls} />
  if (/turn/i.test(v)) return <CornerUpRight size={14} className={cls} />
  if (/off ramp/i.test(v)) return <CornerDownRight size={14} className={cls} />
  if (/merge/i.test(v)) return <Merge size={14} className={cls} />
  if (/fork/i.test(v)) return <GitFork size={14} className={cls} />
  if (/end of road/i.test(v)) return <ArrowRightLeft size={14} className={cls} />
  return <ArrowUp size={14} className={cls} />
}

function verbLabel(verb: string): string {
  const v = verb.toLowerCase()
  if (/depart/i.test(v)) return 'Start'
  if (/arrive/i.test(v)) return 'Arrive'
  if (/off ramp/i.test(v)) return 'Take off-ramp'
  if (/merge/i.test(v)) return 'Merge'
  if (/fork/i.test(v)) return 'Take fork'
  if (/end of road/i.test(v)) return 'End of road'
  if (/new name/i.test(v)) return 'Continue'
  if (/turn right/i.test(v)) return 'Turn right'
  if (/turn left/i.test(v)) return 'Turn left'
  if (/turn/i.test(v)) return 'Turn'
  if (/continue|straight/i.test(v)) return 'Continue'
  return verb.charAt(0).toUpperCase() + verb.slice(1)
}

function isWarn(s: string) { return /stair|step|escalator/i.test(s) }
function isHighway(s: string) { return /highway|interstate|freeway|parkway|frontage/i.test(s) }

function formatDist(dist: string): string {
  const m = parseInt(dist)
  if (isNaN(m)) return dist
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`
  return `${m} m`
}

function GeoInput({ label, value, color, onPick, onClear }: {
  label: string; value?: GeoResult; color: string
  onPick: (g: GeoResult) => void; onClear: () => void
}) {
  const [q, setQ] = useState(value?.shortName ?? '')
  const [results, setResults] = useState<GeoResult[]>([])
  const [busy, setBusy] = useState(false)
  const [geoBusy, setGeoBusy] = useState(false)
  const [err, setErr] = useState('')

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
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <span className="w-12 shrink-0 text-xs font-medium text-muted">{label}</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/60"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${label.toLowerCase()}…`}
          aria-label={label}
        />
        {busy && <Loader2 size={13} className="animate-spin text-primary" />}
        {q && !busy && (
          <button onClick={() => { setQ(''); setResults([]); onClear() }}
            className="rounded-full p-0.5 text-muted hover:text-ink" title="Clear">
            <X size={13} />
          </button>
        )}
        <div className="h-4 w-px bg-border" />
        <button onClick={useMyLocation} title="Use my location"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors">
          {geoBusy ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
        </button>
      </div>
      {err && <p className="mt-1 text-xs text-alert">{err}</p>}
      {results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {results.map((r, i) => (
            <button key={i} onClick={() => { onPick(r); setQ(r.shortName); setResults([]) }}
              className="block w-full border-b border-border/60 px-3 py-2.5 text-left last:border-0 hover:bg-bg transition-colors">
              <p className="text-sm font-medium">{r.shortName}</p>
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
  const [steps, setSteps] = useState<string[]>([])
  const [meta, setMeta] = useState<{ km: number; min: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [wheelchairMode, setWheelchairMode] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(true)

  const startRef = useRef<GeoResult>(); startRef.current = start
  const endRef = useRef<GeoResult>(); endRef.current = end

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, { attributionControl: false, zoomControl: false })
      .setView([39.5, -98.35], 4)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
      .addTo(map)
    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 100)

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const g = await reverseGeocode(e.latlng.lat, e.latlng.lng)
      if (!startRef.current) setStart(g)
      else if (!endRef.current) setEnd(g)
      else setEnd(g)
    })

    if (navigator.geolocation && window.isSecureContext) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const g = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        g.shortName = 'My location'
        setStart((prev) => prev ?? g)
      }, () => {}, { enableHighAccuracy: true, timeout: 8000 })
    }

    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (lineRef.current) return
    markersRef.current.forEach((m) => m.remove()); markersRef.current = []
    if (start) markersRef.current.push(L.marker([start.lat, start.lng], { icon: dot('#0ABFBF') }).addTo(map).bindTooltip('Start'))
    if (end) markersRef.current.push(L.marker([end.lat, end.lng], { icon: dot('#FF6B47') }).addTo(map).bindTooltip('Destination'))
    if (start && end) map.fitBounds(L.latLngBounds([[start.lat, start.lng], [end.lat, end.lng]]), { padding: [60, 60] })
    else if (start) map.setView([start.lat, start.lng], 14)
    else if (end) map.setView([end.lat, end.lng], 14)
  }, [start, end])

  async function plan() {
    if (!start || !end || !mapRef.current) return
    setBusy(true); setErr('')
    try {
      const routeFn = wheelchairMode ? getWheelchairRoute : getWalkingRoute
      const { coords, distance, duration, steps } = await routeFn([start.lat, start.lng], [end.lat, end.lng])
      lineRef.current?.remove()
      markersRef.current.forEach((m) => m.remove())
      const routeColor = wheelchairMode ? '#2563eb' : '#0ABFBF'
      const line = L.polyline(coords, { color: routeColor, weight: 5, opacity: 0.85 }).addTo(mapRef.current)
      lineRef.current = line
      markersRef.current = [
        L.marker([start.lat, start.lng], { icon: dot(routeColor) }).addTo(mapRef.current).bindTooltip('Start'),
        L.marker([end.lat, end.lng], { icon: dot('#FF6B47') }).addTo(mapRef.current).bindTooltip('Destination'),
      ]
      mapRef.current.fitBounds(line.getBounds(), { padding: [50, 50] })
      setSteps(steps)
      setMeta({ km: distance / 1000, min: Math.round(duration / 60) })
      setStepsOpen(true)
    } catch {
      setErr(wheelchairMode
        ? 'No wheelchair-accessible route found. Try a shorter trip or switch to walking mode.'
        : 'No walking route found between those points.')
    } finally { setBusy(false) }
  }

  function reset() {
    lineRef.current?.remove(); lineRef.current = null
    markersRef.current.forEach((m) => m.remove()); markersRef.current = []
    setStart(undefined); setEnd(undefined); setSteps([]); setMeta(null); setErr('')
  }

  const warnings = steps.filter(isWarn).length
  const highways = steps.filter(isHighway).length

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Route planner</h1>
        <p className="mt-1 text-muted">Walking & wheelchair-accessible directions between any two points.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-4">

          {/* Input card */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2">
            <GeoInput label="From" value={start} color="#0ABFBF" onPick={setStart} onClear={() => setStart(undefined)} />
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted">to</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <GeoInput label="To" value={end} color="#FF6B47" onPick={setEnd} onClear={() => setEnd(undefined)} />
          </div>

          {/* Wheelchair toggle */}
          <button
            onClick={() => setWheelchairMode((v) => !v)}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-150 ${
              wheelchairMode
                ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950 dark:text-blue-300'
                : 'border-border bg-card text-muted hover:border-border/80 hover:text-ink'
            }`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${wheelchairMode ? 'bg-blue-500 text-white' : 'bg-bg text-muted'}`}>
              <Accessibility size={16} />
            </span>
            <div className="text-left">
              <p className="font-semibold leading-tight">Wheelchair accessible</p>
              <p className="text-xs font-normal opacity-70">Avoids stairs &amp; steep grades</p>
            </div>
            <div className={`ml-auto h-5 w-9 rounded-full transition-colors ${wheelchairMode ? 'bg-blue-500' : 'bg-border'}`}>
              <div className={`mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${wheelchairMode ? 'translate-x-4.5 ml-0.5' : 'ml-0.5'}`} />
            </div>
          </button>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={plan} disabled={!start || !end || busy}
              className="btn-primary flex-1 disabled:opacity-40">
              {busy ? <Loader2 className="animate-spin" size={15} /> : <Navigation size={15} />}
              {busy ? 'Planning…' : 'Plan route'}
            </button>
            <a
              href={start && end ? googleMapsDir([start.lat, start.lng], [end.lat, end.lng]) : undefined}
              target="_blank" rel="noreferrer"
              aria-disabled={!start || !end}
              className={`gmaps-btn flex-1 ${!start || !end ? 'pointer-events-none opacity-40' : ''}`}
            >
              <ExternalLink size={15} /> Google Maps
            </a>
          </div>

          {(start || end) && !busy && (
            <button onClick={reset} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors">
              <RotateCcw size={13} /> Reset
            </button>
          )}

          {err && (
            <div className="flex items-start gap-2 rounded-xl border border-alert/30 bg-alert/5 px-3 py-2.5 text-sm text-alert">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          )}

          {/* Route summary */}
          {meta && (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Stats bar */}
              <div className={`flex items-center gap-4 px-4 py-3 ${wheelchairMode ? 'bg-blue-50 dark:bg-blue-950/50' : 'bg-primary/5'}`}>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <Route size={14} className={wheelchairMode ? 'text-blue-600' : 'text-primary'} />
                  <span>{meta.km.toFixed(1)} km</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <Clock size={14} className={wheelchairMode ? 'text-blue-600' : 'text-primary'} />
                  <span>~{meta.min} min</span>
                </div>
                {wheelchairMode && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <span className="flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                      <Accessibility size={10} /> Wheelchair
                    </span>
                  </>
                )}
              </div>

              {/* Warning banners */}
              {warnings > 0 && (
                <div className="flex items-center gap-2 border-b border-alert/20 bg-alert/5 px-4 py-2 text-xs text-alert">
                  <AlertTriangle size={12} />
                  {warnings} accessibility warning{warnings > 1 ? 's' : ''} — stairs or steps detected
                </div>
              )}
              {highways > 0 && wheelchairMode && (
                <div className="flex items-center gap-2 border-b border-amber-400/20 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={12} />
                  Route includes major roads — consider a shorter trip for better wheelchair paths
                </div>
              )}

              {/* Steps */}
              <button
                onClick={() => setStepsOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-bg transition-colors"
              >
                <span className="text-sm font-semibold">Turn-by-turn directions</span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  {steps.length} steps
                  {stepsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>

              {stepsOpen && (
                <ol className="max-h-72 overflow-y-auto divide-y divide-border/50">
                  {steps.map((s, i) => {
                    const { verb, road, dist } = parseStep(s)
                    const warn = isWarn(s)
                    const hw = isHighway(s)
                    const isFirst = i === 0
                    const isLast = i === steps.length - 1
                    return (
                      <li key={i} className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors
                        ${warn ? 'bg-alert/5 text-alert' : hw && wheelchairMode ? 'bg-amber-50/40 dark:bg-amber-950/10' : 'hover:bg-bg'}
                      `}>
                        {/* Step number + icon */}
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
                          ${isFirst || isLast
                            ? (wheelchairMode ? 'bg-blue-500 text-white' : 'bg-primary text-white')
                            : warn ? 'bg-alert/15 text-alert' : 'bg-bg text-muted border border-border'
                          }`}>
                          {isFirst ? <MapPin size={11} /> : isLast ? <Flag size={11} /> : <StepIcon verb={verb} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-tight">{verbLabel(verb)}</p>
                          {road && <p className="mt-0.5 truncate text-xs text-muted">{road}</p>}
                        </div>
                        {dist && (
                          <span className="shrink-0 rounded-md bg-bg px-1.5 py-0.5 text-[11px] font-medium text-muted border border-border/60">
                            {formatDist(dist)}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>
          )}

          {!meta && !busy && (
            <p className="text-center text-xs text-muted pt-2">
              Click the map to set start & destination, or search above.
            </p>
          )}
        </div>

        {/* ── Map ── */}
        <div ref={elRef} className="h-[540px] cursor-crosshair overflow-hidden rounded-2xl border border-border shadow-sm lg:h-[calc(100vh-160px)] lg:min-h-[500px]" />
      </div>
    </Layout>
  )
}
