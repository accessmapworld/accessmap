import { spaced } from './rateLimit'
import { haversineKm } from './overpass'

export type TrailDifficulty = 'beginner' | 'easy' | 'moderate' | 'hard' | 'expert'
export type TrailSurface = 'paved' | 'gravel' | 'dirt' | 'rock' | 'unknown'
export type TrailType = 'hiking' | 'biking'

export interface Trail {
  id: string
  osmId: string
  name: string
  trailType: TrailType
  difficulty: TrailDifficulty
  surface: TrailSurface
  surfaceRaw?: string
  lengthKm: number
  geometry: [number, number][] // [lat, lng] pairs
  center: [number, number]
  distanceKm?: number          // from user/search center
  // OSM detail tags
  sacScale?: string
  trailVisibility?: string
  inclineMax?: number          // % grade
  widthM?: number
  wheelchair?: string
  description?: string
  operator?: string
  network?: string             // e.g. rwn, nwn, lwn
  from?: string
  to?: string
  color?: string               // trail blaze color
  // Computed
  accessibleForWheelchair: boolean
  elevationGainM?: number      // rough estimate from incline × length
  estimatedMinutes: number
  tags: Record<string, string>
}

// OSM sac_scale → difficulty
const SAC_MAP: Record<string, TrailDifficulty> = {
  hiking:                      'easy',
  mountain_hiking:             'moderate',
  demanding_mountain_hiking:   'hard',
  alpine_hiking:               'hard',
  demanding_alpine_hiking:     'expert',
  difficult_alpine_hiking:     'expert',
}

// OSM trail_visibility → difficulty cap
const VIS_CAP: Record<string, TrailDifficulty> = {
  excellent: 'beginner',
  good:      'easy',
  intermediate: 'moderate',
  bad:       'hard',
  horrible:  'expert',
  no:        'expert',
}

function parseSurface(raw: string): TrailSurface {
  if (!raw) return 'unknown'
  const s = raw.toLowerCase()
  if (['asphalt','paved','concrete','paving_stones','wood','metal','tartan'].includes(s)) return 'paved'
  if (['gravel','fine_gravel','compacted','pebblestone','unpaved'].includes(s)) return 'gravel'
  if (['dirt','ground','earth','grass','mud','sand','woodchips'].includes(s)) return 'dirt'
  if (['rock','rocky','stone','sett','cobblestone'].includes(s)) return 'rock'
  return 'unknown'
}

function estimateDifficulty(tags: Record<string, string>): TrailDifficulty {
  const sac = tags.sac_scale?.toLowerCase()
  if (sac && SAC_MAP[sac]) return SAC_MAP[sac]

  const vis = tags.trail_visibility?.toLowerCase()
  const visCap = vis ? VIS_CAP[vis] : undefined

  const incline = parseFloat(tags.incline?.replace(/[^0-9.-]/g, '') ?? '')
  const highIncline = !isNaN(incline) && Math.abs(incline) > 15

  const surface = parseSurface(tags.surface ?? '')
  const hw = tags.highway?.toLowerCase()

  // Derive from surface + highway
  let base: TrailDifficulty
  if (hw === 'cycleway' || (hw === 'path' && surface === 'paved')) base = 'beginner'
  else if (hw === 'footway' || surface === 'paved') base = 'beginner'
  else if (surface === 'gravel' || hw === 'track') base = 'easy'
  else if (surface === 'dirt') base = 'moderate'
  else if (surface === 'rock') base = 'hard'
  else base = 'easy'

  // Bump up for steep incline
  if (highIncline) {
    const order: TrailDifficulty[] = ['beginner','easy','moderate','hard','expert']
    const idx = order.indexOf(base)
    base = order[Math.min(idx + 1, order.length - 1)]
  }

  // Apply visibility cap (bad visibility → at least that hard)
  if (visCap) {
    const order: TrailDifficulty[] = ['beginner','easy','moderate','hard','expert']
    base = order[Math.max(order.indexOf(base), order.indexOf(visCap))]
  }

  return base
}

function calcLengthKm(geometry: [number, number][]): number {
  let total = 0
  for (let i = 1; i < geometry.length; i++) {
    total += haversineKm(geometry[i - 1], geometry[i])
  }
  return Math.round(total * 100) / 100
}

function centerOf(geometry: [number, number][]): [number, number] {
  const sumLat = geometry.reduce((s, p) => s + p[0], 0)
  const sumLng = geometry.reduce((s, p) => s + p[1], 0)
  return [sumLat / geometry.length, sumLng / geometry.length]
}

// Rough walking speed on different surfaces
const SPEED_KMH: Record<TrailDifficulty, number> = {
  beginner: 5.0,
  easy:     4.0,
  moderate: 3.0,
  hard:     2.5,
  expert:   2.0,
}

const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
]

async function overpass(q: string, signal?: AbortSignal): Promise<any> {
  for (const ep of OVERPASS) {
    try {
      const r = await fetch(ep, { method: 'POST', body: 'data=' + encodeURIComponent(q), signal })
      if (r.ok) return await r.json()
    } catch (e) {
      if ((e as any)?.name === 'AbortError') throw e
    }
  }
  throw new Error('Overpass unavailable')
}

export async function getNearbyTrails(
  center: [number, number],
  radiusM = 5000,
  signal?: AbortSignal,
): Promise<Trail[]> {
  await spaced('overpass', 800)
  const [lat, lng] = center

  const q = `
[out:json][timeout:40];
(
  way["highway"~"^(path|track|bridleway)$"]["foot"!="no"](around:${radiusM},${lat},${lng});
  way["highway"="footway"]["name"](around:${radiusM},${lat},${lng});
  way["highway"="cycleway"](around:${radiusM},${lat},${lng});
  way["bicycle"~"^(yes|designated)$"]["highway"~"^(path|track)$"](around:${radiusM},${lat},${lng});
  relation["route"~"^(hiking|foot|walking|bicycle|mtb)$"](around:${radiusM},${lat},${lng});
);
out body geom qt;`

  let data: any
  try { data = await overpass(q, signal) } catch (e) {
    if ((e as any)?.name === 'AbortError') throw e
    return []
  }

  const seen = new Set<string>()
  const trails: Trail[] = []

  let unnamed = 0
  for (const el of data.elements as any[]) {
    const tags: Record<string, string> = el.tags ?? {}

    // Build geometry from OSM 'geometry' field (out geom) or 'members' for relations
    let geometry: [number, number][] = []

    if (el.type === 'way' && el.geometry) {
      geometry = (el.geometry as { lat: number; lon: number }[])
        .filter(p => p.lat && p.lon)
        .map(p => [p.lat, p.lon])
    } else if (el.type === 'relation' && el.members) {
      // Concatenate member way geometries
      for (const m of el.members) {
        if (m.type === 'way' && m.geometry) {
          const pts = (m.geometry as { lat: number; lon: number }[])
            .filter(p => p.lat && p.lon)
            .map(p => [p.lat, p.lon] as [number, number])
          geometry.push(...pts)
        }
      }
    }

    if (geometry.length < 2) continue

    // Deduplicate by OSM id
    const dedupeKey = `${el.type}-${el.id}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    const hw = tags.highway ?? ''
    const isBike = hw === 'cycleway'
      || tags.bicycle === 'designated' || tags.bicycle === 'yes'
      || (el.type === 'relation' && ['bicycle','mtb'].includes(tags.route ?? ''))
    const trailType: TrailType = isBike ? 'biking' : 'hiking'
    const hwLabel = hw === 'footway' ? 'Footpath' : hw === 'track' ? 'Track' : hw === 'bridleway' ? 'Bridleway' : hw === 'cycleway' ? 'Bike path' : 'Trail'
    const name = tags.name || tags['name:en'] || tags.ref || `${hwLabel} ${++unnamed}`

    const difficulty = estimateDifficulty(tags)
    const surface = parseSurface(tags.surface ?? '')
    const lengthKm = tags.length
      ? parseFloat(tags.length) / 1000
      : calcLengthKm(geometry)
    const center2 = centerOf(geometry)
    const inclineRaw = parseFloat(tags.incline?.replace(/[^0-9.-]/g, '') ?? '')
    const inclineMax = !isNaN(inclineRaw) ? Math.abs(inclineRaw) : undefined
    const accessibleForWheelchair = tags.wheelchair === 'yes' ||
      (surface === 'paved' && difficulty === 'beginner' && (inclineMax == null || inclineMax < 8))

    const speed = SPEED_KMH[difficulty]
    const estimatedMinutes = Math.round((lengthKm / speed) * 60)

    trails.push({
      id: `${el.type}-${el.id}`,
      osmId: `${el.type}/${el.id}`,
      name,
      trailType,
      difficulty,
      surface,
      surfaceRaw: tags.surface,
      lengthKm,
      geometry,
      center: center2,
      sacScale: tags.sac_scale,
      trailVisibility: tags.trail_visibility,
      inclineMax,
      widthM: tags.width ? parseFloat(tags.width) : undefined,
      wheelchair: tags.wheelchair,
      description: tags.description || tags['description:en'] || undefined,
      operator: tags.operator || undefined,
      network: tags.network || undefined,
      from: tags.from || undefined,
      to: tags.to || undefined,
      color: tags['osmc:symbol'] || tags.color || undefined,
      accessibleForWheelchair,
      estimatedMinutes,
      tags,
    })
  }

  // Sort by distance from center, cap at 200
  return trails
    .sort((a, b) => haversineKm(center, a.center) - haversineKm(center, b.center))
    .slice(0, 200)
}

export const DIFFICULTY_META: Record<TrailDifficulty, {
  label: string; color: string; bg: string; border: string; description: string
}> = {
  beginner: {
    label: 'Beginner', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    description: 'Paved or compacted surface, flat or very gentle slope',
  },
  easy: {
    label: 'Easy', color: '#15803d', bg: '#dcfce7', border: '#86efac',
    description: 'Well-maintained path, minor elevation changes',
  },
  moderate: {
    label: 'Moderate', color: '#b45309', bg: '#fffbeb', border: '#fde68a',
    description: 'Uneven terrain, some elevation gain, basic fitness needed',
  },
  hard: {
    label: 'Hard', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5',
    description: 'Steep sections, rough terrain, good fitness required',
  },
  expert: {
    label: 'Expert', color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd',
    description: 'Alpine or technical terrain, experience required',
  },
}

export const SURFACE_LABEL: Record<TrailSurface, string> = {
  paved:   'Paved',
  gravel:  'Gravel',
  dirt:    'Dirt',
  rock:    'Rock',
  unknown: 'Unknown',
}
