import { spaced } from './rateLimit'

export interface GeoResult {
  displayName: string
  shortName: string
  lat: number
  lng: number
  osmId: string
}

/** OpenStreetMap Nominatim search with autocomplete-friendly defaults. */
export async function searchPlaces(q: string, signal?: AbortSignal): Promise<GeoResult[]> {
  if (q.trim().length < 3) return []
  await spaced('nominatim', 1100) // respect Nominatim's ~1 req/sec policy
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '6')
  const res = await fetch(url, {
    signal,
    headers: { 'Accept-Language': 'en' },
  })
  if (!res.ok) return []
  const data = (await res.json()) as Array<{
    display_name: string
    name?: string
    lat: string
    lon: string
    osm_type: string
    osm_id: number
  }>
  return data.map((d) => ({
    displayName: d.display_name,
    shortName: d.name || d.display_name.split(',')[0],
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
    osmId: `${d.osm_type}/${d.osm_id}`,
  }))
}

/** Reverse-geocode a coordinate into a friendly label. Falls back gracefully. */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
  try {
    await spaced('nominatim', 1100)
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lng))
    url.searchParams.set('format', 'jsonv2')
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    if (res.ok) {
      const d = await res.json()
      const display = d.display_name as string | undefined
      const short = d.name || display?.split(',').slice(0, 2).join(',') || 'Selected point'
      return { displayName: display || `${lat.toFixed(5)}, ${lng.toFixed(5)}`, shortName: short, lat, lng, osmId: 'reverse' }
    }
  } catch { /* ignore */ }
  return { displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, shortName: 'Selected point', lat, lng, osmId: 'reverse' }
}

// Two OSRM foot servers — primary is routing.openstreetmap.de (global planet),
// fallback is router.project-osrm.org. Both are free and key-free.
const OSRM_FOOT = [
  'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
  'https://router.project-osrm.org/route/v1/foot',
]

async function osrmRoute(
  start: [number, number],
  end: [number, number],
): Promise<{ coords: [number, number][]; distance: number; duration: number; steps: string[] }> {
  await spaced('osrm', 600)
  let lastErr: Error = new Error('Routing failed')
  for (const base of OSRM_FOOT) {
    try {
      const url = `${base}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`
      const res = await fetch(url)
      if (!res.ok) { lastErr = new Error('Routing failed'); continue }
      const data = await res.json()
      const route = data.routes?.[0]
      if (!route) { lastErr = new Error('No route found'); continue }
      const coords: [number, number][] = route.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]],
      )
      const steps: string[] = (route.legs?.[0]?.steps ?? []).map((s: any) => {
        const name = s.name || 'the path'
        const m = Math.round(s.distance)
        const type = s.maneuver?.modifier
          ? `${s.maneuver.type} ${s.maneuver.modifier}`
          : (s.maneuver?.type ?? 'continue')
        return `${type} on ${name} — ${m} m`
      })
      return { coords, distance: route.distance, duration: route.duration, steps }
    } catch (e) { lastErr = e as Error }
  }
  throw lastErr
}

/** Global walking route (covers the entire planet via OSM OSRM). */
export async function getWalkingRoute(
  start: [number, number],
  end: [number, number],
): Promise<{ coords: [number, number][]; distance: number; duration: number; steps: string[] }> {
  return osrmRoute(start, end)
}

/** Wheelchair-accessible route — same engine, wheelchair warnings flagged in the UI. */
export async function getWheelchairRoute(
  start: [number, number],
  end: [number, number],
): Promise<{ coords: [number, number][]; distance: number; duration: number; steps: string[] }> {
  return osrmRoute(start, end)
}

function decodePolyline(encoded: string, precision = 5): [number, number][] {
  const factor = Math.pow(10, precision)
  const coords: [number, number][] = []
  let lat = 0, lng = 0, i = 0
  while (i < encoded.length) {
    let b, shift = 0, result = 0
    do { b = encoded.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    shift = 0; result = 0
    do { b = encoded.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    coords.push([lat / factor, lng / factor])
  }
  return coords
}
