import type { AccessSpecs } from '../types'
import { deriveAccess, type ScoreBreakdown } from './overpass'
import { fetchWikiImage } from './wikipedia'

export interface OsmData {
  osmId?: string
  name?: string
  accessScore: number | null
  accessLabel: string
  breakdown: ScoreBreakdown
  specs: Partial<AccessSpecs>
  imageUrl?: string
  openingHours?: string
  phone?: string
  website?: string
  wheelchairDescription?: string
  extras: { label: string; value: string }[]
  raw: Record<string, string>
}

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

// Tags used to pick the most-detailed element when multiple are returned
const A11Y_TAGS = [
  'wheelchair', 'ramp', 'ramp:wheelchair', 'tactile_paving', 'step_count',
  'entrance:step_count', 'step_height', 'lift', 'elevator',
  'toilets:wheelchair', 'wheelchair:toilets', 'surface', 'smoothness',
  'handrail', 'ramp:handrail', 'parking:disabled', 'capacity:disabled',
  'door:width', 'entrance:width', 'ramp:width', 'lift:width', 'lift:depth',
  'elevator:width', 'elevator:depth', 'kerb', 'incline', 'ramp:incline',
  'hearing_loop', 'deaf:loop', 'menu:braille', 'braille',
  'quiet_room', 'sensory_room', 'changing_place', 'changing_table:wheelchair',
  'assistance_dog', 'capacity:wheelchair', 'wheelchair:seating',
  'min_width', 'wheelchair:width', 'toilets:grab_rail', 'grab_rail',
  'turning_circle:wheelchair', 'turning_space', 'automatic_door', 'door:automatic',
  'wheelchair:description',
]

export async function fetchOsmDetails(lat: number, lng: number, signal?: AbortSignal): Promise<OsmData | null> {
  // First try: named elements within 150m
  const q1 = `
    [out:json][timeout:20];
    (
      node(around:150,${lat},${lng})["name"];
      way(around:150,${lat},${lng})["name"];
    );
    out center tags 15;`

  // Fallback: any element with accessibility tags within 50m (no name required)
  const q2 = `
    [out:json][timeout:20];
    (
      node(around:50,${lat},${lng})["wheelchair"];
      way(around:50,${lat},${lng})["wheelchair"];
    );
    out center tags 5;`

  let data: any
  try {
    data = await overpassQuery(q1, signal)
    if (!(data?.elements?.length)) {
      data = await overpassQuery(q2, signal)
    }
  } catch { return null }

  const elements: any[] = data?.elements ?? []
  if (elements.length === 0) return null

  // Pick the element with the most accessibility-relevant tags
  const scored = elements.map((el: any) => {
    const t: Record<string, string> = el.tags ?? {}
    const score = A11Y_TAGS.filter(k => t[k] && t[k] !== 'no').length
    return { el, t, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const { el, t } = scored[0]

  // Run same scoring engine as POI cards
  const derived = deriveAccess(t)

  // ── Map to AccessSpecs ────────────────────────────────────────────
  const specs: Partial<AccessSpecs> = {}

  // Step-free entrance
  const wc = t.wheelchair?.toLowerCase()
  if (wc === 'yes') specs.hasStepFreeEntrance = true
  else if (wc === 'no') specs.hasStepFreeEntrance = false

  // Steps / kerb
  const stepCount = parseInt(t.step_count ?? t['entrance:step_count'] ?? t['steps:count'] ?? '')
  if (!isNaN(stepCount)) {
    specs.entranceStepCount = stepCount
    if (stepCount === 0) specs.hasStepFreeEntrance = true
  }
  if (derived.stepHeightCm != null) specs.stepHeightCm = derived.stepHeightCm
  if (derived.kerbType) specs.kerbType = derived.kerbType
  if (derived.entranceLevel) specs.entranceLevel = derived.entranceLevel

  // Ramp
  specs.rampPresent = derived.hasRamp
  if (derived.rampGradient != null) {
    specs.rampGradientPct = derived.rampGradient
    specs.rampGradient = derived.rampGradient <= 5 ? 'gentle' : derived.rampGradient <= 10 ? 'moderate' : 'steep'
  }
  if (derived.rampWidthCm != null) specs.rampWidthCm = derived.rampWidthCm
  if (derived.rampHasHandrail != null) specs.rampHasHandrails = derived.rampHasHandrail

  // Door
  if (derived.doorWidthCm != null) specs.doorWidthCm = derived.doorWidthCm
  if (derived.doorType === 'Automatic') specs.doorType = 'automatic'
  else if (t.door === 'hinged' || t.door === 'manual') specs.doorType = 'manual'
  else if (t.door === 'revolving') specs.doorType = 'revolving'

  // Lift
  specs.hasLift = derived.hasLift
  if (derived.liftWidthCm != null) specs.liftDoorWidthCm = derived.liftWidthCm
  if (derived.liftDepthCm != null) specs.liftDepthCm = derived.liftDepthCm

  // Accessible WC
  if (derived.accessibleToilet) specs.hasAccessibleToilet = true
  else if ((t['toilets:wheelchair'] || t['wheelchair:toilets'] || '').toLowerCase() === 'no') specs.hasAccessibleToilet = false

  // WC grab rail
  const grabRailRaw = (t['toilets:grab_rail'] || t.grab_rail || '').toLowerCase()
  if (grabRailRaw === 'yes') specs.toiletGrabRails = true
  else if (grabRailRaw === 'no') specs.toiletGrabRails = false

  // WC turning space — parse to cm
  const turningRaw = t['turning_circle:wheelchair'] || t['turning_space']
  if (turningRaw) {
    const v = parseFloat(turningRaw.replace(/[^0-9.]/g, ''))
    if (!isNaN(v) && v > 0) {
      // OSM values like "150 cm" or "1.5 m" or bare "150"
      const lower = turningRaw.toLowerCase()
      specs.turningSpaceCm = lower.includes('cm') ? Math.round(v)
        : lower.includes('m') ? Math.round(v * 100)
        : v < 10 ? Math.round(v * 100) : Math.round(v)
    }
  }

  // Surface / tactile
  if (derived.surface) {
    const s = derived.surface
    if (['asphalt', 'paved', 'concrete', 'paving_stones', 'tiles', 'wood', 'rubber'].includes(s)) specs.floorSurface = 'smooth'
    else if (s === 'carpet') specs.floorSurface = 'carpet'
    else if (['sett', 'cobblestone', 'unhewn_cobblestone'].includes(s)) specs.floorSurface = 'cobblestone'
    else if (['gravel', 'ground', 'dirt', 'sand', 'grass', 'earth', 'mud'].includes(s)) specs.floorSurface = 'gravel'
    else if (['compacted', 'fine_gravel', 'pebblestone', 'bricks'].includes(s)) specs.floorSurface = 'uneven'
  }
  if (derived.tactile) specs.hasTactilePaving = true
  else if (t.tactile_paving?.toLowerCase() === 'no') specs.hasTactilePaving = false

  // Parking
  if (derived.hasDisabledParking != null) specs.hasDisabledParking = derived.hasDisabledParking
  if (derived.disabledParkingSpaces != null) specs.disabledParkingSpaces = derived.disabledParkingSpaces

  // ── Image ─────────────────────────────────────────────────────────
  let imageUrl: string | undefined
  if (t.image && /^https?:\/\//.test(t.image)) {
    imageUrl = t.image
  } else if (t.wikimedia_commons) {
    const file = t.wikimedia_commons.replace(/^(File:|Category:)/, '').trim()
    imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=800`
  } else if (t.name) {
    // Race Wikipedia against a 2s timeout so it never blocks OSM details from rendering
    imageUrl = await Promise.race([
      fetchWikiImage(t.name),
      new Promise<undefined>(res => setTimeout(() => res(undefined), 2000)),
    ]) || undefined
  }

  // ── Extras (displayed in the info card, not badge section) ────────
  const extras: { label: string; value: string }[] = []
  if (t['wheelchair:description'])
    extras.push({ label: 'Accessibility note', value: t['wheelchair:description'] })
  if (t.fee === 'no') extras.push({ label: 'Admission', value: 'Free entry' })
  else if (t.fee === 'yes') extras.push({ label: 'Admission', value: 'Paid' })
  if (t['addr:street']) {
    const addr = [t['addr:housenumber'], t['addr:street'], t['addr:city']].filter(Boolean).join(' ')
    extras.push({ label: 'Address (OSM)', value: addr })
  }
  // Sensory / communication
  if ((t['hearing_loop'] || t['deaf:loop'] || '').toLowerCase() === 'yes')
    extras.push({ label: 'Hearing loop', value: 'Yes' })
  if ((t['menu:braille'] || t['braille'] || '').toLowerCase() === 'yes')
    extras.push({ label: 'Braille menu', value: 'Available' })
  if ((t['quiet_room'] || t['sensory_room'] || '').toLowerCase() === 'yes')
    extras.push({ label: 'Quiet / sensory room', value: 'Available' })
  if ((t['changing_place'] || t['changing_table:wheelchair'] || '').toLowerCase() === 'yes')
    extras.push({ label: 'Changing Place', value: 'Available' })
  if ((t['assistance_dog'] || '').toLowerCase() === 'yes')
    extras.push({ label: 'Assistance dogs', value: 'Allowed' })
  const wSeating = t['capacity:wheelchair'] || t['wheelchair:seating']
  if (wSeating && wSeating !== 'no' && wSeating !== '0')
    extras.push({ label: 'Wheelchair seating', value: /^\d+$/.test(wSeating) ? `${wSeating} spaces` : 'Available' })
  const minWidth = t['min_width'] || t['wheelchair:width']
  if (minWidth) extras.push({ label: 'Min. corridor width', value: minWidth })

  return {
    osmId: `${el.type}/${el.id}`,
    name: t.name,
    accessScore: derived.accessScore,
    accessLabel: derived.accessLabel,
    breakdown: derived.breakdown,
    specs,
    imageUrl,
    openingHours: t.opening_hours || undefined,
    phone: t.phone || t['contact:phone'] || undefined,
    website: t.website || t['contact:website'] || undefined,
    wheelchairDescription: t['wheelchair:description'] || undefined,
    extras,
    raw: t,
  }
}
