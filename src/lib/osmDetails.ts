import type { AccessSpecs } from '../types'
import { deriveAccess, type ScoreBreakdown } from './overpass'
import { fetchWikiImage } from './wikipedia'

export interface OsmData {
  osmId?: string
  name?: string
  // Rich scoring — same engine as POI cards
  accessScore: number | null
  accessLabel: string
  breakdown: ScoreBreakdown
  // Physical fields mapped to AccessSpecs shape
  specs: Partial<AccessSpecs>
  // Media
  imageUrl?: string
  // Contact / info
  openingHours?: string
  phone?: string
  website?: string
  wheelchairDescription?: string
  // Display-only extras
  extras: { label: string; value: string }[]
  /** Raw OSM tags for debugging */
  raw: Record<string, string>
}

export async function fetchOsmDetails(lat: number, lng: number, signal?: AbortSignal): Promise<OsmData | null> {
  const q = `
    [out:json][timeout:15];
    (
      node(around:80,${lat},${lng})["name"];
      way(around:80,${lat},${lng})["name"];
    );
    out body tags 5;`

  let data: any
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=' + encodeURIComponent(q),
      signal,
    })
    if (!res.ok) return null
    data = await res.json()
  } catch { return null }

  const elements: any[] = data?.elements ?? []
  if (elements.length === 0) return null

  // Pick the element with the most accessibility tags
  const scored = elements.map((el: any) => {
    const t: Record<string, string> = el.tags ?? {}
    const score = ['wheelchair', 'ramp', 'tactile_paving', 'step_count', 'lift',
      'toilets:wheelchair', 'surface', 'handrail', 'parking:disabled'].filter(k => t[k]).length
    return { el, t, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const { el, t } = scored[0]

  // ── Run the same scoring engine used for POI cards ────────────────
  const derived = deriveAccess(t)

  // ── Map to AccessSpecs ────────────────────────────────────────────
  const specs: Partial<AccessSpecs> = {}

  const wc = t.wheelchair?.toLowerCase()
  if (wc === 'yes') specs.hasStepFreeEntrance = true
  else if (wc === 'no') specs.hasStepFreeEntrance = false

  // Steps / kerb
  const stepCount = parseInt(t.step_count ?? t['entrance:step_count'] ?? t['steps:count'] ?? '')
  if (!isNaN(stepCount)) { specs.entranceStepCount = stepCount; if (stepCount === 0) specs.hasStepFreeEntrance = true }
  if (derived.stepHeightCm != null) specs.stepHeightCm = derived.stepHeightCm
  if (derived.kerbType) specs.kerbType = derived.kerbType
  if (derived.entranceLevel) specs.entranceLevel = derived.entranceLevel

  // Ramp
  if (derived.hasRamp != null) specs.rampPresent = derived.hasRamp
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

  // Lift
  if (derived.hasLift != null) specs.hasLift = derived.hasLift
  if (derived.liftWidthCm != null) specs.liftDoorWidthCm = derived.liftWidthCm
  if (derived.liftDepthCm != null) specs.liftDepthCm = derived.liftDepthCm

  if (derived.accessibleToilet) specs.hasAccessibleToilet = true
  else if ((t['toilets:wheelchair'] || t['wheelchair:toilets'] || '').toLowerCase() === 'no') specs.hasAccessibleToilet = false

  const grabRail = t['toilets:grab_rail'] ?? t.grab_rail
  if (grabRail === 'yes') specs.toiletGrabRails = true
  else if (grabRail === 'no') specs.toiletGrabRails = false

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

  if (derived.hasDisabledParking != null) specs.hasDisabledParking = derived.hasDisabledParking
  if (derived.disabledParkingSpaces != null) specs.disabledParkingSpaces = derived.disabledParkingSpaces

  // ── Image ─────────────────────────────────────────────────────────
  let imageUrl: string | undefined
  if (t.image && /^https?:\/\//.test(t.image)) imageUrl = t.image
  else if (t.wikimedia_commons) {
    const file = t.wikimedia_commons.replace(/^(File:|Category:)/, '').trim()
    imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=800`
  }
  // Fall back to Wikipedia thumbnail
  if (!imageUrl && t.name) {
    imageUrl = await fetchWikiImage(t.name) || undefined
  }

  // ── Extras ────────────────────────────────────────────────────────
  const extras: { label: string; value: string }[] = []
  if (t['wheelchair:description']) extras.push({ label: 'Accessibility note', value: t['wheelchair:description'] })
  const kerb = t.kerb ?? t['curb']
  if (kerb) extras.push({ label: 'Kerb / dropped kerb', value: kerb })
  if (t.level) extras.push({ label: 'Floor level', value: t.level })
  if (t.fee === 'no') extras.push({ label: 'Admission', value: 'Free entry' })
  else if (t.fee === 'yes') extras.push({ label: 'Admission', value: 'Paid' })
  if (t['addr:street']) {
    const addr = [t['addr:housenumber'], t['addr:street'], t['addr:city']].filter(Boolean).join(' ')
    extras.push({ label: 'Address (OSM)', value: addr })
  }
  // Sensory / hearing / extra accessibility
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
  if (t['toilets:grab_rail'] || t['grab_rail']) extras.push({ label: 'Grab rails', value: t['toilets:grab_rail'] === 'yes' || t['grab_rail'] === 'yes' ? 'Yes' : 'No' })
  if (t['turning_circle:wheelchair'] || t['turning_space']) extras.push({ label: 'Wheelchair turning space', value: t['turning_circle:wheelchair'] || t['turning_space'] })

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
