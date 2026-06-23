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

/** OSRM walking route → array of [lat, lng] coordinates + steps. */
export async function getWalkingRoute(
  start: [number, number],
  end: [number, number],
): Promise<{ coords: [number, number][]; distance: number; duration: number; steps: string[] }> {
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
