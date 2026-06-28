const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
]

async function overpassQuery(q: string, signal?: AbortSignal): Promise<any> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(q),
        signal,
      })
      if (res.ok) return await res.json()
    } catch (e) {
      if ((e as any)?.name === 'AbortError') throw e
    }
  }
  throw new Error('All Overpass endpoints failed')
}

export interface TransitLine {
  id: string
  name: string
  color: string
  coords: [number, number][]
}

export interface TransitStation {
  id: string
  name: string
  lat: number
  lng: number
  type: 'train' | 'subway' | 'bus' | 'tram'
  lines?: string[]
  wheelchair?: 'yes' | 'limited' | 'no'
}

export interface WalkingPath {
  id: string
  coords: [number, number][]
  highway: string
  surface?: string
  lit?: boolean
  wheelchair?: string
}

const ROUTE_COLORS: Record<string, string> = {
  train: '#1a73e8',
  subway: '#9c27b0',
  tram: '#e91e63',
  light_rail: '#ff5722',
  monorail: '#795548',
  bus: '#ff9800',
}

export async function getNearbyTransit(
  center: [number, number],
  radiusM = 5000,
  signal?: AbortSignal,
): Promise<{ lines: TransitLine[]; stations: TransitStation[] }> {
  const [lat, lng] = center
  const q = `
    [out:json][timeout:30];
    (
      node["railway"~"station|halt|tram_stop|subway_entrance"](around:${radiusM},${lat},${lng});
      way["railway"~"rail|subway|tram|light_rail|monorail"](around:${radiusM},${lat},${lng});
    );
    out body geom qt 200;`

  let data: any
  try {
    data = await overpassQuery(q, signal)
  } catch (e) {
    if ((e as any)?.name === 'AbortError') throw e
    return { lines: [], stations: [] }
  }

  const lines: TransitLine[] = []
  const stations: TransitStation[] = []

  for (const el of data.elements as any[]) {
    if (el.type === 'node') {
      const tags = el.tags ?? {}
      const railway = tags.railway ?? ''
      let type: TransitStation['type'] = 'train'
      if (railway === 'tram_stop') type = 'tram'
      else if (railway === 'subway_entrance') type = 'subway'
      stations.push({
        id: `node-${el.id}`,
        name: tags.name || tags['name:en'] || (type === 'tram' ? 'Tram stop' : 'Station'),
        lat: el.lat,
        lng: el.lon,
        type,
        wheelchair: tags.wheelchair as TransitStation['wheelchair'],
      })
    } else if (el.type === 'way' && el.geometry?.length) {
      const tags = el.tags ?? {}
      const railType = tags.railway ?? 'train'
      const color = ROUTE_COLORS[railType] ?? '#1a73e8'
      const coords: [number, number][] = el.geometry.map((g: any) => [g.lat, g.lon] as [number, number])
      lines.push({
        id: `way-${el.id}`,
        name: tags.name || tags.ref || railType,
        color,
        coords,
      })
    }
  }

  return { lines, stations }
}

export async function getNearbyWalkingPaths(
  center: [number, number],
  radiusM = 2000,
  signal?: AbortSignal,
): Promise<WalkingPath[]> {
  const [lat, lng] = center
  const q = `
    [out:json][timeout:30];
    way["highway"~"footway|pedestrian|path|steps|bridleway"](around:${radiusM},${lat},${lng});
    out body geom qt 500;`

  let data: any
  try {
    data = await overpassQuery(q, signal)
  } catch (e) {
    if ((e as any)?.name === 'AbortError') throw e
    return []
  }

  const paths: WalkingPath[] = []
  for (const el of data.elements as any[]) {
    if (el.type !== 'way' || !el.geometry?.length) continue
    const tags = el.tags ?? {}
    paths.push({
      id: `way-${el.id}`,
      coords: el.geometry.map((g: any) => [g.lat, g.lon] as [number, number]),
      highway: tags.highway ?? 'footway',
      surface: tags.surface,
      lit: tags.lit === 'yes',
      wheelchair: tags.wheelchair,
    })
  }
  return paths
}
