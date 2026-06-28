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

/** OSRM walking route → array of [lat, lng] coordinates + steps. */
export async function getWalkingRoute(
  start: [number, number],
  end: [number, number],
): Promise<{ coords: [number, number][]; distance: number; duration: number; steps: string[] }> {
  await spaced('osrm', 600)
  const url = `https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Routing failed')
  const data = await res.json()
  const route = data.routes?.[0]
  if (!route) throw new Error('No route found')
  const coords: [number, number][] = route.geometry.coordinates.map(
    (c: [number, number]) => [c[1], c[0]],
  )
  const steps: string[] = (route.legs?.[0]?.steps ?? []).map((s: any) => {
    const name = s.name || 'the path'
    const m = Math.round(s.distance)
    return `${s.maneuver?.type ?? 'continue'} on ${name} — ${m} m`
  })
  return { coords, distance: route.distance, duration: route.duration, steps }
}

/** Valhalla wheelchair route — avoids stairs, high grades, and inaccessible surfaces. */
export async function getWheelchairRoute(
  start: [number, number],
  end: [number, number],
): Promise<{ coords: [number, number][]; distance: number; duration: number; steps: string[] }> {
  await spaced('valhalla', 600)
  const body = {
    locations: [
      { lat: start[0], lon: start[1] },
      { lat: end[0], lon: end[1] },
    ],
    costing: 'pedestrian',
    costing_options: {
      pedestrian: {
        step_penalty: 30,
        max_grade: 8,
        walking_speed: 3.1,
        use_ferry: 0,
      },
    },
    directions_options: { units: 'kilometers', language: 'en-US' },
  }
  const res = await fetch('https://valhalla1.openstreetmap.de/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Wheelchair routing failed')
  const data = await res.json()
  const leg = data.trip?.legs?.[0]
  if (!leg) throw new Error('No route found')

  const coords = decodePolyline(leg.shape, 6)

  const steps: string[] = (leg.maneuvers ?? []).map((m: any) => {
    const name = m.street_names?.join(' / ') || 'the path'
    const dist = m.length ? `${(m.length * 1000).toFixed(0)} m` : ''
    const verb = m.instruction || `${m.type ?? 'continue'} on ${name}`
    return dist ? `${verb} — ${dist}` : verb
  })

  const summary = data.trip?.summary
  return {
    coords,
    distance: (summary?.length ?? 0) * 1000,
    duration: (summary?.time ?? 0),
    steps,
  }
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
