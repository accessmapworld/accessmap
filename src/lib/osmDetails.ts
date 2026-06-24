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

  const stepCount = parseInt(t.step_count ?? t['entrance:step_count'] ?? '')
  if (!isNaN(stepCount)) { specs.entranceStepCount = stepCount; if (stepCount === 0) specs.hasStepFreeEntrance = true }

  if (derived.hasRamp != null) specs.rampPresent = derived.hasRamp

  const inclineVal = parseFloat((t.incline || '').replace(/[%°]/g, ''))
  if (!isNaN(inclineVal)) specs.rampGradient = Math.abs(inclineVal) <= 5 ? 'gentle' : Math.abs(inclineVal) <= 10 ? 'moderate' : 'steep'

  const handrail = t.handrail ?? t['ramp:handrail']
  if (['yes', 'both', 'left', 'right'].includes(handrail || '')) specs.rampHasHandrails = true
  else if (handrail === 'no') specs.rampHasHandrails = false

  const doorWidthRaw = t['door:width'] ?? t['entrance:width'] ?? t.width
  if (doorWidthRaw) {
    const w = parseFloat(doorWidthRaw.replace(/[^0-9.]/g, ''))
    if (!isNaN(w)) specs.doorWidthCm = doorWidthRaw.includes('m') ? Math.round(w * 100) : Math.round(w)
  }
  if (derived.doorType === 'Automatic') specs.doorType = 'automatic'
  else if (t.door === 'hinged') specs.doorType = 'manual'

  if (derived.hasLift != null) specs.hasLift = derived.hasLift

  const liftWidth = t['lift:width'] ?? t['elevator:width']
  if (liftWidth) {
    const w = parseFloat(liftWidth.replace(/[^0-9.]/g, ''))
    if (!isNaN(w)) specs.liftDoorWidthCm = liftWidth.includes('m') ? Math.round(w * 100) : Math.round(w)
  }

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
