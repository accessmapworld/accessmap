import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Loader2, X, LocateFixed, Accessibility, ExternalLink,
  MapPin as MapPinIcon, AlertTriangle, Route as RouteIcon, Mountain, Toilet,
  Navigation2, ChevronRight, Car, ArrowUpDown, Zap, Clock, Info,
} from 'lucide-react'
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
  const [locating, setLocating] = useState(false)

  const [q, setQ] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)

  const [activeCat, setActiveCat] = useState<CategoryKey | null>(null)
  const [pois, setPois] = useState<Poi[]>([])
  const [loadingPois, setLoadingPois] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [showA11y, setShowA11y] = useState(true)
  const [forMeOnly, setForMeOnly] = useState(false)
  // null = no message; string = show toast
  const [locToast, setLocToast] = useState<{ msg: string; type: 'info' | 'error' } | null>(null)
  const needsProfile = useStore((s) => s.needsProfile)
  const profileActive = hasProfile(needsProfile)
  const [showIntro, setShowIntro] = useState(() => {
    try { return sessionStorage.getItem('am.introSeen') !== '1' } catch { return true }
  })

  function dismissIntro() {
    setShowIntro(false)
    try { sessionStorage.setItem('am.introSeen', '1') } catch { /* */ }
  }

  const abortRef = useRef<AbortController | null>(null)
  const poiAbort = useRef<AbortController | null>(null)
  const watchRef = useRef<number | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getPlaces().then(setPlaces)
    getAlerts().then(setAlerts)
    // Silent startup — never show errors, just try to centre map
    locateSilent()
  }, [])

  useEffect(() => () => {
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current)
  }, [])

  function showToast(msg: string, type: 'info' | 'error' = 'info') {
    setLocToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setLocToast(null), 6000)
  }

  // IP fallback — try two services so one outage doesn't break everything
  async function ipCoords(): Promise<[number, number] | null> {
    const services = [
      async () => {
        const d = await fetch('https://get.geojs.io/v1/ip/geo.json').then(r => r.json())
        const lat = parseFloat(d.latitude), lng = parseFloat(d.longitude)
        if (!isNaN(lat) && !isNaN(lng)) return [lat, lng] as [number, number]
        return null
      },
      async () => {
        const d = await fetch('https://ipapi.co/json/').then(r => r.json())
        if (d.latitude && d.longitude) return [d.latitude, d.longitude] as [number, number]
        return null
      },
    ]
    for (const fn of services) {
      try { const c = await fn(); if (c) return c } catch { /* try next */ }
    }
    return null
  }

  function startWatch() {
    if (watchRef.current != null) return
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 },
    )
  }

  // Silent startup: never show toasts, just do best-effort centering
  async function locateSilent() {
    if (!navigator?.geolocation) {
      const c = await ipCoords()
      if (c) { setCenter(c); setFocus({ lat: c[0], lng: c[1], zoom: 12 }) }
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setUserLoc({ lat, lng })
        setCenter([lat, lng])
        setFocus({ lat, lng, zoom: 15 })
        startWatch()
      },
      async () => {
        // GPS failed silently — try IP, no error shown
        const c = await ipCoords()
        if (c) { setCenter(c); setFocus({ lat: c[0], lng: c[1], zoom: 12 }) }
        // If both fail, map just stays centered on [0,0] — user can search
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    )
  }

  // User-triggered location (locate button or intro CTA)
  function locateExplicit(onDone?: (c: [number, number]) => void) {
    setLocating(true)
    setLocToast(null)

    if (!navigator?.geolocation) {
      ipCoords().then((c) => {
        setLocating(false)
        if (c) {
          setCenter(c); setFocus({ lat: c[0], lng: c[1], zoom: 12 })
          onDone?.(c)
        } else {
          showToast('Location unavailable — try searching for a place.', 'error')
        }
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setLocating(false)
        setLocToast(null)
        setUserLoc({ lat, lng })
        setCenter([lat, lng])
        setFocus({ lat, lng, zoom: 15 })
        startWatch()
        onDone?.([lat, lng])
      },
      async (err) => {
        const c = await ipCoords()
        setLocating(false)
        if (c) {
          setCenter(c); setFocus({ lat: c[0], lng: c[1], zoom: 12 })
          if (err.code === 1) {
            showToast('Location permission denied. Allow it in your browser to see your precise position.', 'info')
          }
          // No toast for timeout/unavailable — IP fallback works fine, no need to alarm the user
          onDone?.(c)
        } else {
          showToast(
            err.code === 1
              ? 'Location permission denied. Allow it in your browser settings, or search for a place.'
              : 'Could not determine your location. Try searching for a place.',
            'error',
          )
        }
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 30000 },
    )
  }

  // Search autocomplete
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
    setActiveCat(cat); setLoadingPois(true); setPanelOpen(true); setPois([])
    poiAbort.current?.abort()
    const ac = new AbortController(); poiAbort.current = ac
    try {
      let found = await nearbyByCategory(c, cat, 3000, ac.signal)
      if (found.length === 0) found = await nearbyByCategory(c, cat, 8000, ac.signal)
      setPois(found)
    } catch { /* aborted or timeout */ }
    finally { setLoadingPois(false) }
  }

  function runCategory(cat: CategoryKey) {
    if (activeCat === cat) { setActiveCat(null); setPois([]); setPanelOpen(false); return }
    const c = userLoc ? ([userLoc.lat, userLoc.lng] as [number, number]) : center
    if (c) {
      searchCategory(cat, c)
    } else {
      setActiveCat(cat); setPanelOpen(true); setLoadingPois(true)
      locateExplicit((loc) => searchCategory(cat, loc))
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
    return [...pois].sort((a, b) => {
      const sa = a.accessScore ?? -1, sb = b.accessScore ?? -1
      if (sb !== sa) return sb - sa
      return dist(a) - dist(b)
    })
  }, [pois, center])

  const activeCatMeta = CATEGORIES.find((c) => c.key === activeCat)

  return (
    <div className="relative h-screen overflow-hidden bg-[#e8eaed]">
      <Navbar />

      {/* Map fills everything below nav */}
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

      {/* OSM attribution */}
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer"
        className="absolute bottom-2 right-2 z-[700] rounded-md bg-white/90 px-2 py-0.5 text-[10px] text-[#6b7280] shadow-sm hover:text-[#111827]">
        © OpenStreetMap contributors
      </a>

      {/* ── Left panel ───────────────────────────────────────────── */}
      <div
        role="region"
        aria-label="Search and filter panel"
        className="pointer-events-none absolute left-0 top-16 bottom-0 z-[800] flex w-full flex-col gap-2.5 px-3 pb-4 pt-3 sm:w-[25rem]"
      >

        {/* Search bar */}
        <div className="pointer-events-auto shrink-0">
          <div
            role="search"
            className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-1 shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
          >
            <Search size={17} className="shrink-0 text-[#9aa0a6]" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search places, buildings, addresses…"
              aria-label="Search for accessible places"
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-expanded={results.length > 0}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-[#202124] outline-none placeholder:text-[#9aa0a6]"
            />
            {searching && <Loader2 size={15} className="shrink-0 animate-spin text-primary" aria-label="Searching…" />}
            {q && !searching && (
              <button
                onClick={() => { setQ(''); setResults([]) }}
                aria-label="Clear search"
                className="shrink-0 rounded-full p-1 text-[#9aa0a6] hover:bg-[#f1f3f4] hover:text-[#202124]"
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
            <div className="h-5 w-px shrink-0 bg-[#dadce0]" aria-hidden="true" />
            <button
              onClick={() => locateExplicit()}
              aria-label="Use my current location"
              disabled={locating}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              {locating
                ? <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                : <LocateFixed size={17} aria-hidden="true" />}
            </button>
          </div>

          {/* Search results dropdown */}
          {results.length > 0 && (
            <div
              id="search-results"
              role="listbox"
              aria-label="Search results"
              className="mt-1.5 overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.14)]"
            >
              {results.map((r, i) => (
                <button
                  key={r.osmId + i}
                  role="option"
                  onClick={() => pickResult(r)}
                  className="flex w-full items-center gap-3 border-b border-[#f1f3f4] px-4 py-3 text-left last:border-0 hover:bg-[#f8f9fa]"
                >
                  <MapPinIcon size={15} className="shrink-0 text-[#9aa0a6]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#202124]">{r.shortName}</p>
                    <p className="truncate text-xs text-[#6b7280]">{r.displayName}</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto shrink-0 text-[#9aa0a6]" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          {/* Location toast */}
          {locToast && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-2 flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-sm shadow-md ${
                locToast.type === 'error'
                  ? 'bg-[#fce8e6] text-[#c5221f]'
                  : 'bg-[#e8f0fe] text-[#1a73e8]'
              }`}
            >
              {locToast.type === 'error'
                ? <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                : <Navigation2 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />}
              <span className="flex-1 leading-snug">{locToast.msg}</span>
              <button
                onClick={() => setLocToast(null)}
                aria-label="Dismiss"
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Category + filter chips */}
        <div className="pointer-events-auto flex shrink-0 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setShowA11y((s) => !s)}
            className={`chip shrink-0 ${showA11y ? 'chip-active' : ''}`}
            aria-pressed={showA11y}
          >
            <Accessibility size={15} aria-hidden="true" /> Accessible
          </button>
          {profileActive && (
            <button
              onClick={() => setForMeOnly((s) => !s)}
              className={`chip shrink-0 ${forMeOnly ? 'chip-active' : 'border-primary/40 text-primary'}`}
              aria-pressed={forMeOnly}
            >
              ✦ {needsProfile.name ? `${needsProfile.name.split(' ')[0]}'s map` : 'For Me'}
            </button>
          )}
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => runCategory(key)}
              className={`chip shrink-0 ${activeCat === key ? 'chip-active' : ''}`}
              aria-pressed={activeCat === key}
            >
              <Icon size={15} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {/* POI results panel */}
        {panelOpen && (
          <aside className="pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.14)]">
            {/* Panel header */}
            <div className="flex items-center gap-3 border-b border-[#f1f3f4] px-4 py-3">
              {activeCatMeta && (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ background: activeCatMeta.color }}
                >
                  <activeCatMeta.icon size={19} aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#202124]">{activeCatMeta?.label}</p>
                <p className="text-xs text-[#6b7280]">
                  {loadingPois ? 'Searching nearby…' : `${sortedPois.length} place${sortedPois.length !== 1 ? 's' : ''} found`}
                </p>
              </div>
              <button
                onClick={() => { setPanelOpen(false); setActiveCat(null); setPois([]) }}
                aria-label="Close panel"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f1f3f4] hover:text-[#202124]"
              >
                <X size={17} />
              </button>
            </div>

            {/* Accessibility legend strip */}
            <div className="flex items-center gap-3 border-b border-[#f1f3f4] bg-[#f8f9fa] px-4 py-2 text-[11px] text-[#6b7280]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#22c55e]" aria-hidden="true" /> Accessible</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#eab308]" aria-hidden="true" /> Partial</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#FF6B47]" aria-hidden="true" /> Not rated</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#9aa0a6]" aria-hidden="true" /> Unknown</span>
            </div>

            {/* List */}
            <div className="min-h-0 flex-1 divide-y divide-[#f1f3f4] overflow-y-auto">
              {loadingPois && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-[#6b7280]">
                  <Loader2 size={24} className="animate-spin text-primary" aria-label="Loading…" />
                  <p className="text-sm">Finding accessible places…</p>
                </div>
              )}
              {!loadingPois && sortedPois.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <span className="text-3xl" aria-hidden="true">🔍</span>
                  <p className="text-sm font-medium text-[#202124]">Nothing found nearby</p>
                  <p className="text-xs text-[#6b7280]">Try moving the map or choosing a different category.</p>
                </div>
              )}
              {sortedPois.map((p, i) => {
                const dist = center ? haversineKm(center, [p.lat, p.lng]) : null
                const bd = p.breakdown
                return (
                  <div
                    key={p.id}
                    className="border-b border-[#f1f3f4] last:border-0"
                    style={{ animation: 'pageIn 280ms ease-out both', animationDelay: `${Math.min(i, 10) * 35}ms` }}
                  >
                    {/* Photo */}
                    {p.imageUrl && (
                      <div className="relative h-32 w-full overflow-hidden bg-[#f1f3f4]">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        {/* Score pill over photo */}
                        <div className="absolute left-2 bottom-2">
                          {p.accessScore != null ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
                              style={{ background: scoreColor(p.accessScore) }}
                            >
                              {p.accessScore.toFixed(1)}/10 · {p.accessLabel}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
                              Unrated
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => setFocus({ lat: p.lat, lng: p.lng, zoom: 17 })}
                          className="min-w-0 flex-1 text-left"
                          aria-label={`Focus map on ${p.name}`}
                        >
                          <p className="font-semibold text-[#202124] leading-tight">{p.name}</p>
                          <p className="mt-0.5 text-xs text-[#6b7280]">
                            {p.address || activeCatMeta?.label}
                            {dist != null && (
                              <span className="ml-1 text-[#1a73e8]">
                                · {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}
                              </span>
                            )}
                          </p>
                        </button>
                        <a
                          href={googleMapsTo([p.lat, p.lng])}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Directions to ${p.name}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dadce0] text-primary hover:bg-primary hover:text-white hover:border-primary transition-colors"
                        >
                          <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      </div>

                      {/* Score without photo */}
                      {!p.imageUrl && (
                        <div className="mt-2">
                          {p.accessScore != null ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                              style={{ background: scoreColor(p.accessScore) }}
                            >
                              <Accessibility size={10} aria-hidden="true" />
                              {p.accessScore.toFixed(1)}/10 · {p.accessLabel}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f3f4] px-2.5 py-0.5 text-xs text-[#6b7280]">
                              <Info size={10} aria-hidden="true" /> Unrated
                            </span>
                          )}
                        </div>
                      )}

                      {/* Score breakdown */}
                      {bd.base !== null && (
                        <div className="mt-2.5 rounded-lg bg-[#f8f9fa] px-3 py-2 text-[11px]">
                          <p className="font-semibold text-[#202124] mb-1">Score breakdown</p>
                          <p className="text-[#6b7280]">Base: {bd.base}/10 — {bd.baseReason}</p>
                          {bd.bonuses.map(b => (
                            <p key={b.label} className="text-[#1e8e3e]">+{b.points} {b.label}</p>
                          ))}
                          {bd.penalties.map(p => (
                            <p key={p.label} className="text-[#c5221f]">{p.points} {p.label}</p>
                          ))}
                          {bd.confidence === 'low' || bd.confidence === 'none' ? (
                            <p className="mt-1 text-[#9aa0a6] italic">⚠ Estimated from surface data — not OSM-confirmed</p>
                          ) : null}
                        </div>
                      )}

                      {/* Physical feature badges */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {p.terrain !== 'Unknown' && (
                          <span className="badge"><Mountain size={10} aria-hidden="true" /> {p.terrain}</span>
                        )}
                        {p.hasRamp && (
                          <span className="badge text-[#1e8e3e] border-[#1e8e3e]/30 bg-[#e6f4ea]">
                            <ArrowUpDown size={10} aria-hidden="true" /> Ramp
                          </span>
                        )}
                        {p.hasLift && (
                          <span className="badge text-[#1e8e3e] border-[#1e8e3e]/30 bg-[#e6f4ea]">
                            <Zap size={10} aria-hidden="true" /> Lift
                          </span>
                        )}
                        {p.accessibleToilet && (
                          <span className="badge text-[#1e8e3e] border-[#1e8e3e]/30 bg-[#e6f4ea]">
                            <Toilet size={10} aria-hidden="true" /> Accessible WC
                          </span>
                        )}
                        {p.hasDisabledParking && (
                          <span className="badge text-[#1e8e3e] border-[#1e8e3e]/30 bg-[#e6f4ea]">
                            <Car size={10} aria-hidden="true" /> Disabled parking
                          </span>
                        )}
                        {p.doorType && (
                          <span className="badge"><ArrowUpDown size={10} aria-hidden="true" /> {p.doorType} door</span>
                        )}
                        {p.tactile && (
                          <span className="badge">Tactile paving</span>
                        )}
                      </div>

                      {/* Mapper's accessibility note */}
                      {p.wheelchairDescription && (
                        <p className="mt-2 text-[11px] italic text-[#6b7280] leading-snug">
                          "{p.wheelchairDescription}"
                        </p>
                      )}

                      {/* Opening hours */}
                      {p.openingHours && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#6b7280]">
                          <Clock size={10} aria-hidden="true" /> {p.openingHours}
                        </p>
                      )}

                      {/* Ramp note */}
                      {p.rampNote && (
                        <p className="mt-1 text-[11px] text-[#6b7280]">Ramp: {p.rampNote}</p>
                      )}

                      {/* Detail page + OSM links */}
                      <div className="mt-2 flex items-center gap-3">
                        <a
                          href={`/place/${p.id}?lat=${p.lat}&lng=${p.lng}&name=${encodeURIComponent(p.name)}`}
                          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary/90"
                        >
                          Full details →
                        </a>
                        <a
                          href={`https://www.openstreetmap.org/${p.osmId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#9aa0a6] hover:text-primary hover:underline"
                        >
                          OSM ↗
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom legend (desktop only, when no panel open) */}
      {showA11y && !panelOpen && (
        <div className="absolute bottom-6 left-4 z-[700] hidden items-center gap-3 rounded-full bg-white/95 px-4 py-2 text-xs text-[#6b7280] shadow-[0_2px_8px_rgba(0,0,0,0.12)] sm:flex">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f5b50a]" aria-hidden="true" /> Sponsored</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0ABFBF]" aria-hidden="true" /> Accessible</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f9ab00]" aria-hidden="true" /> Alert</span>
          <Link to="/business" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            <MapPinIcon size={12} aria-hidden="true" /> List your business
          </Link>
        </div>
      )}

      {/* Welcome overlay */}
      {showIntro && (
        <div
          className="fixed inset-0 z-[950] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
        >
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#0ABFBF] to-[#1a73e8] px-7 py-7 text-center text-white">
              <div className="mx-auto mb-3 flex justify-center">
                <BrandPin size={56} />
              </div>
              <h2 id="intro-title" className="text-2xl font-bold">Welcome to AccessMap</h2>
              <p className="mt-1 text-sm text-white/85">Crowdsourced accessibility intelligence</p>
            </div>

            <div className="px-6 py-5">
              <div className="space-y-3">
                {[
                  { icon: Accessibility, color: '#0ABFBF', title: 'Accessibility scores', body: 'Mobility, sensory, hearing & vision — rated by the community.' },
                  { icon: AlertTriangle, color: '#ea4335', title: 'Live alerts', body: 'Real-time reports like "elevator offline", verified by AI.' },
                  { icon: RouteIcon, color: '#1a73e8', title: 'Step-free routes', body: 'Plan accessible routes and open them in Google Maps.' },
                ].map((f) => {
                  const Icon = f.icon
                  return (
                    <div key={f.title} className="flex items-start gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ background: f.color }}
                        aria-hidden="true"
                      >
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#202124]">{f.title}</p>
                        <p className="text-xs text-[#6b7280]">{f.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  onClick={() => { dismissIntro(); locateExplicit() }}
                  className="btn-primary w-full"
                >
                  <LocateFixed size={16} aria-hidden="true" /> Use my location
                </button>
                <button onClick={dismissIntro} className="btn-ghost w-full">
                  Explore the map
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-[#9aa0a6]">
                By continuing you agree to our{' '}
                <a href="/terms" className="underline hover:text-primary">Terms</a> &{' '}
                <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
                Your location is never stored without consent.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
