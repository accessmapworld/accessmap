import {
  Utensils, Coffee, Hotel, Cross, Pill, GraduationCap, ShoppingBag,
  Landmark, TreePine, Banknote, type LucideIcon,
} from 'lucide-react'
import { spaced } from './rateLimit'

export interface ScoreBreakdown {
  base: number | null
  baseReason: string
  bonuses: { label: string; points: number }[]
  penalties: { label: string; points: number }[]
  total: number | null
  confidence: 'high' | 'medium' | 'low' | 'none'
}

export interface Poi {
  id: string
  osmId: string
  name: string
  lat: number
  lng: number
  category: CategoryKey
  address?: string
  // Core accessibility
  wheelchair?: 'yes' | 'limited' | 'no'
  accessScore: number | null
  accessLabel: string
  breakdown: ScoreBreakdown
  // Physical details
  terrain: string
  surface?: string
  accessibleToilet: boolean
  tactile: boolean
  hasRamp?: boolean
  rampNote?: string
  hasLift?: boolean
  hasDisabledParking?: boolean
  doorType?: string
  // Extra info
  openingHours?: string
  phone?: string
  website?: string
  imageUrl?: string
  wheelchairDescription?: string
}

const SMOOTH = ['asphalt', 'paved', 'concrete', 'paving_stones', 'wood', 'metal', 'rubber', 'tartan', 'tiles']
const UNEVEN = ['sett', 'cobblestone', 'unhewn_cobblestone', 'compacted', 'fine_gravel', 'pebblestone', 'bricks', 'stone']
const ROUGH  = ['gravel', 'ground', 'dirt', 'grass', 'sand', 'earth', 'mud', 'rock', 'woodchips']

function terrainFrom(tags: Record<string, string>): { terrain: string; surface?: string } {
  const surface = (tags.surface || '').toLowerCase() || undefined
  if (!surface) {
    const sm = (tags.smoothness || '').toLowerCase()
    if (['excellent', 'good'].includes(sm)) return { terrain: 'Smooth', surface }
    if (['intermediate'].includes(sm)) return { terrain: 'Uneven', surface }
    if (['bad', 'very_bad', 'horrible', 'very_horrible', 'impassable'].includes(sm)) return { terrain: 'Rough', surface }
    return { terrain: 'Unknown', surface }
  }
  if (SMOOTH.includes(surface)) return { terrain: 'Smooth', surface }
  if (UNEVEN.includes(surface)) return { terrain: 'Uneven', surface }
  if (ROUGH.includes(surface)) return { terrain: 'Rough', surface }
  return { terrain: 'Unknown', surface }
}

/**
 * Honest accessibility scoring from OSM tags.
 *
 * Base scores (NOT inflated):
 *   wheelchair=yes     → 6.0  (confirmed accessible entry, not perfect)
 *   wheelchair=limited → 3.0  (some barriers exist)
 *   wheelchair=no      → 1.0  (hard cap at 2.5 even with bonuses)
 *   inferred smooth    → 4.0  (low confidence)
 *   inferred uneven    → 2.5
 *   inferred rough     → 1.5
 *   no data            → null (shown as Unrated)
 */
export function deriveAccess(tags: Record<string, string>): Omit<Poi,
  'id' | 'osmId' | 'name' | 'lat' | 'lng' | 'category' | 'address'
  | 'imageUrl' | 'openingHours' | 'phone' | 'website' | 'wheelchairDescription'
> {
  const wRaw = (tags.wheelchair || '').toLowerCase()
  const wheelchair = (['yes', 'limited', 'no'].includes(wRaw) ? wRaw : undefined) as Poi['wheelchair']
  const accessibleToilet = (tags['toilets:wheelchair'] || tags['wheelchair:toilets'] || '').toLowerCase() === 'yes'
  const tactile = (tags.tactile_paving || '').toLowerCase() === 'yes'
  const { terrain, surface } = terrainFrom(tags)

  const rampRaw = (tags['ramp:wheelchair'] || tags.ramp || '').toLowerCase()
  const hasRamp = ['yes', 'up', 'down', 'both'].includes(rampRaw)
  const rampNote = tags['ramp:wheelchair:description'] || tags['ramp:description'] || undefined

  const hasLift = (tags.lift || '').toLowerCase() === 'yes'
  const parkingRaw = tags['parking:disabled'] || tags['capacity:disabled'] || ''
  const hasDisabledParking = !!parkingRaw && parkingRaw !== 'no' && parkingRaw !== '0'

  const doorRaw = (tags.automatic_door || tags['door:automatic'] || '').toLowerCase()
  const doorType = doorRaw === 'yes' || doorRaw === 'button' || doorRaw === 'motion'
    ? 'Automatic'
    : tags.door === 'hinged' ? 'Manual' : undefined

  const inclineRaw = parseFloat((tags.incline || '').replace(/[%°]/g, ''))
  const steepIncline = !isNaN(inclineRaw) && Math.abs(inclineRaw) > 8

  // ── Base ─────────────────────────────────────────────────────────
  let base: number | null = null
  let baseReason = ''
  let confidence: ScoreBreakdown['confidence'] = 'none'
  let inferred = false

  if (wheelchair === 'yes') {
    base = 6.0; baseReason = 'Confirmed wheelchair accessible'; confidence = 'high'
  } else if (wheelchair === 'limited') {
    base = 3.0; baseReason = 'Partially accessible — barriers present'; confidence = 'high'
  } else if (wheelchair === 'no') {
    base = 1.0; baseReason = 'Marked as not accessible'; confidence = 'high'
  } else if (terrain === 'Smooth') {
    base = 4.0; baseReason = 'Smooth surface (accessibility unconfirmed)'; confidence = 'low'; inferred = true
  } else if (terrain === 'Uneven') {
    base = 2.5; baseReason = 'Uneven surface — likely difficult'; confidence = 'low'; inferred = true
  } else if (terrain === 'Rough') {
    base = 1.5; baseReason = 'Rough/unpaved — likely inaccessible'; confidence = 'low'; inferred = true
  }

  // ── Bonuses ───────────────────────────────────────────────────────
  const bonuses: { label: string; points: number }[] = []
  if (base !== null && wheelchair !== 'no') {
    if (accessibleToilet)  bonuses.push({ label: 'Accessible toilet ✓', points: 1.0 })
    if (tactile)           bonuses.push({ label: 'Tactile paving ✓', points: 0.5 })
    if (terrain === 'Smooth' && !inferred) bonuses.push({ label: 'Smooth flooring ✓', points: 0.5 })
    if (hasRamp && wheelchair !== 'yes') bonuses.push({ label: 'Ramp present ✓', points: 0.5 })
    if (hasLift)           bonuses.push({ label: 'Lift/elevator ✓', points: 0.5 })
    if (doorType === 'Automatic') bonuses.push({ label: 'Automatic doors ✓', points: 0.3 })
    if (hasDisabledParking) bonuses.push({ label: 'Disabled parking ✓', points: 0.2 })
  }

  // ── Penalties ─────────────────────────────────────────────────────
  const penalties: { label: string; points: number }[] = []
  if (base !== null) {
    if (wheelchair === 'yes' && terrain === 'Rough')
      penalties.push({ label: 'Rough surface despite accessible tag ⚠', points: -1.5 })
    else if (wheelchair === 'yes' && terrain === 'Uneven')
      penalties.push({ label: 'Uneven/irregular surface ⚠', points: -0.5 })
    if (surface && (surface.includes('cobblestone') || surface === 'sett'))
      penalties.push({ label: 'Cobblestone surface ⚠', points: -0.5 })
    if (steepIncline)
      penalties.push({ label: `Steep incline (${Math.abs(inclineRaw).toFixed(0)}%) ⚠`, points: -0.5 })
  }

  // ── Total ─────────────────────────────────────────────────────────
  let total: number | null = null
  if (base !== null) {
    const s = bonuses.reduce((acc, b) => acc + b.points, 0)
         + penalties.reduce((acc, p) => acc + p.points, 0)
    total = base + s
    if (wheelchair === 'no') total = Math.min(total, 2.5)
    total = Math.max(0, Math.min(10, Math.round(total * 10) / 10))
    if (!inferred && (bonuses.length >= 2 || wheelchair === 'yes')) confidence = 'high'
    else if (!inferred) confidence = 'medium'
    else confidence = bonuses.length > 0 ? 'low' : 'none'
  }

  const accessLabel =
    total === null        ? 'Unrated'
    : wheelchair === 'no' ? 'Not accessible'
    : total >= 8.5        ? 'Fully accessible'
    : total >= 6.5        ? 'Accessible'
    : total >= 4.5        ? 'Partly accessible'
    : total >= 2.5        ? 'Limited access'
    : 'Poor access'

  return {
    wheelchair, accessScore: total, accessLabel,
    breakdown: { base, baseReason, bonuses, penalties, total, confidence },
    terrain, surface, accessibleToilet, tactile,
    hasRamp, rampNote, hasLift, hasDisabledParking, doorType,
  }
}

export type CategoryKey =
  | 'restaurant' | 'cafe' | 'hotel' | 'hospital' | 'pharmacy'
  | 'school' | 'shop' | 'park' | 'bank' | 'attraction'

export const CATEGORIES: { key: CategoryKey; label: string; icon: LucideIcon; selector: string; color: string }[] = [
  { key: 'restaurant', label: 'Restaurants', icon: Utensils,      selector: '["amenity"="restaurant"]', color: '#ea4335' },
  { key: 'cafe',       label: 'Coffee',       icon: Coffee,        selector: '["amenity"="cafe"]',       color: '#f29900' },
  { key: 'hotel',      label: 'Hotels',       icon: Hotel,         selector: '["tourism"="hotel"]',      color: '#1a73e8' },
  { key: 'hospital',   label: 'Hospitals',    icon: Cross,         selector: '["amenity"="hospital"]',   color: '#d33b8f' },
  { key: 'pharmacy',   label: 'Pharmacies',   icon: Pill,          selector: '["amenity"="pharmacy"]',   color: '#1e8e3e' },
  { key: 'shop',       label: 'Shopping',     icon: ShoppingBag,   selector: '["shop"]',                 color: '#9334e6' },
  { key: 'school',     label: 'Schools',      icon: GraduationCap, selector: '["amenity"="school"]',     color: '#e37400' },
  { key: 'attraction', label: 'Attractions',  icon: Landmark,      selector: '["tourism"="attraction"]', color: '#12b5cb' },
  { key: 'park',       label: 'Parks',        icon: TreePine,      selector: '["leisure"="park"]',       color: '#34a853' },
  { key: 'bank',       label: 'ATMs & Banks', icon: Banknote,      selector: '["amenity"="bank"]',       color: '#5f6368' },
]

export const categoryColor = (k: CategoryKey): string =>
  CATEGORIES.find((c) => c.key === k)?.color ?? '#ea4335'

function wikimediaThumb(id: string): string | undefined {
  const file = id.replace(/^(File:|Category:)/, '').trim()
  if (!file) return undefined
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=400`
}

export async function nearbyByCategory(
  center: [number, number],
  category: CategoryKey,
  radius = 2000,
  signal?: AbortSignal,
): Promise<Poi[]> {
  const cat = CATEGORIES.find((c) => c.key === category)
  if (!cat) return []
  await spaced('overpass', 1200)
  const [lat, lng] = center
  const q = `
    [out:json][timeout:25];
    (
      node${cat.selector}["name"](around:${radius},${lat},${lng});
      way${cat.selector}["name"](around:${radius},${lat},${lng});
    );
    out center tags 50;`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(q),
    signal,
  })
  if (!res.ok) return []
  const data = await res.json()
  const seen = new Set<string>()
  const out: Poi[] = []
  for (const el of data.elements as any[]) {
    const plat = el.lat ?? el.center?.lat
    const plng = el.lon ?? el.center?.lon
    if (!plat || !plng || !el.tags?.name || seen.has(el.tags.name)) continue
    seen.add(el.tags.name)
    const tags: Record<string, string> = el.tags ?? {}

    let imageUrl: string | undefined
    if (tags.image && /^https?:\/\//.test(tags.image)) imageUrl = tags.image
    else if (tags.wikimedia_commons) imageUrl = wikimediaThumb(tags.wikimedia_commons)

    out.push({
      id: `${el.type}-${el.id}`,
      osmId: `${el.type}/${el.id}`,
      name: tags.name,
      lat: plat,
      lng: plng,
      category,
      address: [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || undefined,
      imageUrl,
      openingHours: tags.opening_hours || undefined,
      phone: tags.phone || tags['contact:phone'] || undefined,
      website: tags.website || tags['contact:website'] || undefined,
      wheelchairDescription: tags['wheelchair:description'] || undefined,
      ...deriveAccess(tags),
    })
  }
  return out
}

export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const la1 = (a[0] * Math.PI) / 180
  const la2 = (b[0] * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
