import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Loader2, X, LocateFixed, Accessibility, ExternalLink, MapPin as MapPinIcon, AlertTriangle, Route as RouteIcon, Mountain, Toilet } from 'lucide-react'
import Navbar from '../components/Navbar'
import BrandPin from '../components/MapPin'
import MapView from '../components/MapView'
import { scoreColor } from '../components/ScoreRing'
import { getPlaces, getAlerts } from '../lib/data'
import { searchPlaces, type GeoResult } from '../lib/nominatim'
import { CATEGORIES, categoryColor, nearbyByCategory, haversineKm, type Poi, type CategoryKey } from '../lib/overpass'
import { googleMapsTo } from '../lib/maps'
import { scorePlace, hasProfile } from '../lib/compatibility'
import { useStore } from '../store/useStore'
import type { Place, Alert } from '../types'

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [center, setCenter] = useState<[number, number] | null>(null)
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number } | null>(null)

  const [q, setQ] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)

  const [activeCat, setActiveCat] = useState<CategoryKey | null>(null)
  const [pois, setPois] = useState<Poi[]>([])
  const [loadingPois, setLoadingPois] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [showA11y, setShowA11y] = useState(true)
  const [forMeOnly, setForMeOnly] = useState(false)
  const [geoError, setGeoError] = useState('')
  const needsProfile = useStore((s) => s.needsProfile)
  const profileActive = hasProfile(needsProfile)
  const [showIntro, setShowIntro] = useState(() => { return false; // landing page handles intro
    try { return sessionStorage.getItem('am.introSeen') !== '1' } catch { return true }
  })
  function dismissIntro() {
    setShowIntro(false)
    try { sessionStorage.setItem('am.introSeen', '1') } catch { /* */ }
  }

  const abortRef = useRef<AbortController | null>(null)
  const poiAbort = useRef<AbortController | null>(null)

  useEffect(() => {
    getPlaces().then(setPlaces)
    getAlerts().then(setAlerts)
    locate(false)
  }, [])

  const watchRef = useRef<number | null>(null)

  // Approximate coords from IP (works without permission). Returns null on failure.
  async function ipCoords(): Promise<[number, number] | null> {
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json')
      const d = await res.json()
      const lat = parseFloat(d.latitude)
      const lng = parseFloat(d.longitude)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng]
    } catch { /* ignore */ }
    return null
  }

  /**
   * Resolve the user's location (live GPS when allowed, IP fallback otherwise),
   * update the map, and run `onDone` with the coordinates once available.
   */
  function locate(announce = true, onDone?: (c: [number, number]) => void) {
    setGeoError('')
    const finish = (lat: number, lng: number, precise: boolean) => {
      if (precise) setUserLoc({ lat, lng })
      setCenter([lat, lng])
      setFocus({ lat, lng, zoom: precise ? 15 : 12 })
      onDone?.([lat, lng])
    }
    const secure = typeof window !== 'undefined' && window.isSecureContext
    if (secure && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          finish(pos.coords.latitude, pos.coords.longitude, true)
          // keep the blue dot live as the user moves
          if (watchRef.current == null) {
            watchRef.current = navigator.geolocation.watchPosition(
              (p) => setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
              () => {},
              { enableHighAccuracy: true, maximumAge: 10000 },
            )
          }
        },
        async () => {
          const c = await ipCoords()
          if (c) {
            finish(c[0], c[1], false)
            if (announce) setGeoError('Showing your approximate area — tap ⊕ and Allow for precise GPS.')
          } else setGeoError('Could not get your location. Search a place to begin.')
        },
        { enableHighAccuracy: true, timeout: 8000 },
      )
    } else {
      ipCoords().then((c) => {
        if (c) {
          finish(c[0], c[1], false)
          if (announce) setGeoError('Approximate area shown. Open at http://localhost:5173 for precise GPS.')
        } else setGeoError('Could not get your location. Search a place to begin.')
      })
    }
  }

  useEffect(() => () => { if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current) }, [])

  // Nominatim free-text autocomplete
  useEffect(() => {
    if (q.trim().length < 3) { setResults([]); return }
    const t = setTimeout(async () => {
      abortRef.current?.abort()
      const ac = new AbortController(); abortRef.current = ac
      setSearching(true)
      try { setResults(await searchPlaces(q, ac.signal)) } catch { /* */ }
      finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [q])

  async function searchCategory(cat: CategoryKey, c: [number, number]) {
    setActiveCat(cat); setLoadingPois(true); setPanelOpen(true); setPois([]); setGeoError('')
    poiAbort.current?.abort()
    const ac = new AbortController(); poiAbort.current = ac
    try {
      let found = await nearbyByCategory(c, cat, 3000, ac.signal)
      if (found.length === 0) found = await nearbyByCategory(c, cat, 8000, ac.signal) // widen once
      setPois(found)
      if (found.length === 0) setGeoError('Nothing of this type nearby — drag the map elsewhere and tap again.')
    } catch {
      setGeoError('Search timed out — please try again.')
    } finally {
      setLoadingPois(false)
    }
  }

  function runCategory(cat: CategoryKey) {
    if (activeCat === cat) { setActiveCat(null); setPois([]); setPanelOpen(false); setGeoError(''); return }
    // Prefer the user's live location; fall back to the visible map center.
    const c = userLoc ? ([userLoc.lat, userLoc.lng] as [number, number]) : center
    if (c) {
      searchCategory(cat, c)
    } else {
      // No location yet — request it, then search around wherever we land.
      setActiveCat(cat); setPanelOpen(true); setLoadingPois(true); setGeoError('Getting your location…')
      locate(true, (loc) => searchCategory(cat, loc))
    }
  }

  function pickResult(r: GeoResult) {
    setCenter([r.lat, r.lng])
    setFocus({ lat: r.lat, lng: r.lng, zoom: 15 })
    setQ(r.shortName); setResults([])
  }

  const alertIds = useMemo(() => new Set(alerts.map((a) => a.placeId)), [alerts])
  const visiblePlaces = useMemo(() => {
    if (!showA11y) return []
    if (forMeOnly && profileActive) return places.filter(p => scorePlace(p, needsProfile).score >= 60)
    return places
  }, [showA11y, forMeOnly, places, needsProfile, profileActive])

  const sortedPois = useMemo(() => {
    const dist = (p: Poi) => (center ? haversineKm(center, [p.lat, p.lng]) : 0)
    // Most accessible first, then nearest.
    return [...pois].sort((a, b) => {
      const sa = a.accessScore ?? -1
      const sb = b.accessScore ?? -1
      if (sb !== sa) return sb - sa
      return dist(a) - dist(b)
    })
  }, [pois, center])

  return (
    <div className="relative h-screen overflow-hidden">
      <Navbar />

      <div id="main-content" className="absolute inset-0 pt-16">
        <MapView
          places={visiblePlaces}
          pois={pois}
          alertPlaceIds={alertIds}
          userLocation={userLoc}
          focus={focus}
          onCenterChange={(lat, lng) => setCenter([lat, lng])}
          onSelect={(p) => setFocus({ lat: p.lat, lng: p.lng, zoom: 16 })}
        />
      </div>

      {/* OpenStreetMap attribution (required for tile usage) */}
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer"
        className="absolute bottom-1 right-1 z-[700] rounded bg-card/85 px-1.5 py-0.5 text-[10px] text-muted shadow-sm hover:text-ink">
        © OpenStreetMap
      </a>

      {/* Left column: search (pinned) + chips + results — Google style */}
      <div role="region" aria-label="Search and filter panel" className="pointer-events-none absolute left-0 top-16 bottom-0 z-[800] flex w-full flex-col gap-3 px-3 pb-3 pt-4 sm:w-[27rem]">
        {/* Search bar */}
        <div className="pointer-events-auto shrink-0">
          <div role="search" className="card flex items-center gap-2.5 rounded-full py-1 pl-4 pr-1.5 shadow-map">
            <Search size={18} className="shrink-0 text-muted" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search places, addresses, buildings…"
              aria-label="Search for accessible places"
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-expanded={results.length > 0}
              className="w-full bg-transparent py-2 text-ink outline-none placeholder:text-muted"
            />
            {searching && <Loader2 size={16} className="animate-spin text-primary" aria-label="Searching…" />}
            {q && !searching && (
              <button onClick={() => { setQ(''); setResults([]) }} aria-label="Clear search" className="rounded-full p-1.5 text-muted hover:bg-bg hover:text-ink"><X size={16} aria-hidden="true" /></button>
            )}
            <span className="h-6 w-px bg-border" aria-hidden="true" />
            <button onClick={() => locate(true)} aria-label="Use my current location"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10">
              <LocateFixed size={18} aria-hidden="true" />
            </button>
          </div>

          {results.length > 0 && (
            <div id="search-results" role="listbox" aria-label="Search results" className="card mt-2 max-h-72 overflow-y-auto">
              {results.map((r, i) => (
                <button key={r.osmId + i} role="option" onClick={() => pickResult(r)}
                  className="block w-full border-b border-border px-4 py-2.5 text-left last:border-0 hover:bg-bg">
                  <p className="text-sm text-ink">{r.shortName}</p>
                  <p className="truncate text-xs text-muted">{r.displayName}</p>
                </button>
              ))}
            </div>
          )}

          {geoError && <p className="mt-2 rounded-lg bg-card px-3 py-1.5 text-xs text-muted shadow-lift">{geoError}</p>}
        </div>

        {/* Category chips */}
        <div className="pointer-events-auto flex shrink-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setShowA11y((s) => !s)} className={`chip ${showA11y ? 'chip-active' : ''}`}>
            <Accessibility size={16} /> Accessible
          </button>
          {profileActive && (
            <button
              onClick={() => setForMeOnly((s) => !s)}
              className={`chip ${forMeOnly ? 'chip-active' : 'border-primary/40 text-primary'}`}
              aria-pressed={forMeOnly}
              title={forMeOnly ? 'Showing places that match your needs' : 'Filter to places that match your needs'}
            >
              ✦ {needsProfile.name ? `${needsProfile.name.split(' ')[0]}'s places` : 'For Me'}
            </button>
          )}
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => runCategory(key)} className={`chip ${activeCat === key ? 'chip-active' : ''}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Results list (fills the column below the chips) */}
        {panelOpen && (
          <aside className="card pointer-events-auto flex min-h-0 flex-1 animate-page-in flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                {activeCat && (() => {
                  const cat = CATEGORIES.find((c) => c.key === activeCat)!
                  const Icon = cat.icon
                  return (
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: cat.color }}>
                      <Icon size={20} />
                    </span>
                  )
                })()}
                <div>
                  <p className="text-base font-semibold">{CATEGORIES.find((c) => c.key === activeCat)?.label}</p>
                  <p className="label">{loadingPois ? 'searching nearby…' : `${sortedPois.length} places near you`}</p>
                </div>
              </div>
              <button onClick={() => { setPanelOpen(false); setActiveCat(null); setPois([]) }} className="rounded-full p-1.5 text-muted transition-colors hover:bg-bg hover:text-ink"><X size={18} /></button>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-2 text-[11px] text-muted">
              <span className="font-medium text-ink">Pins:</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Accessible</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#eab308]" /> Partial</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#FF6B47]" /> Not</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#9aa0a6]" /> Unrated</span>
            </div>

            <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
              {loadingPois && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>}
              {sortedPois.map((p, i) => {
                const dist = center ? haversineKm(center, [p.lat, p.lng]) : null
                const Icon = CATEGORIES.find((c) => c.key === p.category)!.icon
                return (
                  <div key={p.id} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-bg"
                    style={{ animation: 'pageIn 320ms ease-out both', animationDelay: `${Math.min(i, 12) * 40}ms` }}>
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: categoryColor(p.category) }}>
                      <Icon size={16} />
                    </span>
                    <button onClick={() => setFocus({ lat: p.lat, lng: p.lng, zoom: 17 })} className="min-w-0 flex-1 text-left">
                      <p className="truncate font-medium text-ink">{p.name}</p>
                      <p className="truncate text-xs text-muted">
                        {p.address || CATEGORIES.find((c) => c.key === p.category)?.label}
                        {dist != null && <span> · {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}</span>}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {/* accessibility rating */}
                        {p.accessScore != null ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                            style={{ background: scoreColor(p.accessScore) }}>
                            <Accessibility size={11} /> {p.accessScore.toFixed(p.accessScore % 1 ? 1 : 0)}/10 · {p.accessLabel}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-border px-2 py-0.5 text-[11px] font-medium text-muted">
                            <Accessibility size={11} /> Unrated
                          </span>
                        )}
                        {/* terrain */}
                        {p.terrain !== 'Unknown' && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                            <Mountain size={11} /> {p.terrain}
                          </span>
                        )}
                        {/* accessible toilet */}
                        {p.accessibleToilet && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted" title="Accessible toilet">
                            <Toilet size={11} /> WC
                          </span>
                        )}
                      </div>
                    </button>
                    <a href={googleMapsTo([p.lat, p.lng])} target="_blank" rel="noreferrer"
                      title="Directions in Google Maps"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-primary hover:text-white">
                      <ExternalLink size={15} />
                    </a>
                  </div>
                )
              })}
              {!loadingPois && sortedPois.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted">Nothing found nearby. Try moving the map or another category.</p>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Accessible-place quick legend (bottom-left) */}
      {showA11y && !panelOpen && (
        <div className="absolute bottom-5 left-4 z-[700] hidden items-center gap-3 rounded-full bg-card px-4 py-2 text-xs text-muted shadow-map sm:flex">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f5b50a]" /> Sponsored</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-accent" /> Accessible</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f9ab00]" /> Alert</span>
          <Link to="/business" className="inline-flex items-center gap-1 font-medium text-primary"><MapPinIcon size={12} /> List your business</Link>
        </div>
      )}
      {/* Welcome / pitch overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-page-in p-7 text-center">
            <div className="mx-auto mb-1 flex justify-center"><BrandPin size={66} /></div>
            <h2 className="text-2xl font-semibold">Welcome to Access<span className="text-primary">Map</span></h2>
            <p className="mt-1.5 text-muted">Crowdsourced accessibility intelligence — find places that actually work for you.</p>

            <div className="mt-6 space-y-3.5 text-left">
              {[
                { icon: Accessibility, color: '#0ABFBF', title: 'Accessibility scores', body: 'Mobility, sensory, hearing & vision — rated by the community.' },
                { icon: AlertTriangle, color: '#ea4335', title: 'Live alerts', body: 'Real-time reports like “elevator offline”, verified by AI.' },
                { icon: RouteIcon, color: '#1a73e8', title: 'Step-free routes', body: 'Plan accessible routes and open them in Google Maps.' },
              ].map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: f.color }}>
                      <Icon size={20} />
                    </span>
                    <div><p className="font-medium">{f.title}</p><p className="text-sm text-muted">{f.body}</p></div>
                  </div>
                )
              })}
            </div>

            <div className="mt-7 flex gap-3">
              <button onClick={() => { dismissIntro(); locate(true) }} className="btn-primary flex-1"><LocateFixed size={16} /> Use my location</button>
              <button onClick={dismissIntro} className="btn-ghost flex-1">Explore the map</button>
            </div>
            <p className="mt-4 text-xs text-muted/70 leading-relaxed">
              By using AccessMap you agree to our{' '}
              <a href="/terms" className="underline hover:text-primary">Terms of Service</a> and{' '}
              <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
              Location data is used only to show your position on the map and is never stored without consent.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
