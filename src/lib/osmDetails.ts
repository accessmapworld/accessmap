import type { AccessSpecs } from '../types'

export interface OsmData {
  osmId?: string
  /** Mapped to our AccessSpecs shape — shown as OSM baseline */
  specs: Partial<AccessSpecs>
  /** Raw OSM tags for display */
  raw: Record<string, string>
  /** Human-readable extra fields OSM has that don't fit AccessSpecs */
  extras: { label: string; value: string }[]
}

/** Fetch detailed OSM tags for the element closest to (lat, lng) within 80m. */
export async function fetchOsmDetails(lat: number, lng: number, signal?: AbortSignal): Promise<OsmData | null> {
  const q = `
    [out:json][timeout:15];
    (
      node(around:80,${lat},${lng})["name"];
      way(around:80,${lat},${lng})["name"];
    );
    out body 5;`

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

  // Prefer element with most accessibility tags
  const scored = elements.map((el: any) => {
    const t: Record<string, string> = el.tags ?? {}
    const score = ['wheelchair', 'ramp', 'tactile_paving', 'step_count', 'lift', 'toilets:wheelchair', 'surface', 'handrail'].filter(k => t[k]).length
    return { el, t, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const { el, t } = scored[0]

  const specs: Partial<AccessSpecs> = {}
  const extras: { label: string; value: string }[] = []

  // ── Entrance ──────────────────────────────────────────────────────
  const wc = t.wheelchair?.toLowerCase()
  if (wc === 'yes') specs.hasStepFreeEntrance = true
  else if (wc === 'no') specs.hasStepFreeEntrance = false

  const stepCount = parseInt(t.step_count ?? t['entrance:step_count'] ?? '')
  if (!isNaN(stepCount)) {
    specs.entranceStepCount = stepCount
    if (stepCount === 0) specs.hasStepFreeEntrance = true
  }

  const ramp = t['ramp:wheelchair'] ?? t.ramp
  if (ramp === 'yes') specs.rampPresent = true
  else if (ramp === 'no') specs.rampPresent = false

  const incline = t.incline?.replace('%', '').replace('°', '')
  if (incline && !isNaN(parseFloat(incline))) {
    const deg = parseFloat(incline)
    specs.rampGradient = deg <= 5 ? 'gentle' : deg <= 10 ? 'moderate' : 'steep'
  }

  const handrail = t.handrail ?? t['ramp:handrail']
  if (handrail === 'yes' || handrail === 'both' || handrail === 'left' || handrail === 'right') specs.rampHasHandrails = true
  else if (handrail === 'no') specs.rampHasHandrails = false

  const doorWidth = t['door:width'] ?? t['entrance:width'] ?? t.width
  if (doorWidth) {
    const w = parseFloat(doorWidth.replace(/[^0-9.]/g, ''))
    if (!isNaN(w)) specs.doorWidthCm = doorWidth.includes('m') ? Math.round(w * 100) : Math.round(w)
  }

  const automatic = t.automatic_door ?? t['door:automatic']
  if (automatic === 'yes' || automatic === 'button' || automatic === 'motion') specs.doorType = 'automatic'
  else if (t.door === 'hinged' || t.door === 'swinging') specs.doorType = 'manual'

  // ── Interior ──────────────────────────────────────────────────────
  const lift = t.lift ?? t['building:levels'] // lift tag or infer from multi-floor
  if (t.lift === 'yes') specs.hasLift = true
  else if (t.lift === 'no') specs.hasLift = false

  const liftWidth = t['lift:width'] ?? t['elevator:width']
  if (liftWidth) {
    const w = parseFloat(liftWidth.replace(/[^0-9.]/g, ''))
    if (!isNaN(w)) specs.liftDoorWidthCm = liftWidth.includes('m') ? Math.round(w * 100) : Math.round(w)
  }

  const toiletWc = (t['toilets:wheelchair'] ?? t['wheelchair:toilets'] ?? '').toLowerCase()
  if (toiletWc === 'yes') specs.hasAccessibleToilet = true
  else if (toiletWc === 'no') specs.hasAccessibleToilet = false

  const grabRail = t['toilets:grab_rail'] ?? t.grab_rail
  if (grabRail === 'yes') specs.toiletGrabRails = true
  else if (grabRail === 'no') specs.toiletGrabRails = false

  // ── Surface ───────────────────────────────────────────────────────
  const surface = t.surface?.toLowerCase()
  if (surface) {
    if (['asphalt', 'paved', 'concrete', 'paving_stones', 'tiles'].includes(surface)) specs.floorSurface = 'smooth'
    else if (['carpet'].includes(surface)) specs.floorSurface = 'carpet'
    else if (['sett', 'cobblestone', 'unhewn_cobblestone'].includes(surface)) specs.floorSurface = 'cobblestone'
    else if (['gravel', 'ground', 'dirt', 'sand', 'grass'].includes(surface)) specs.floorSurface = 'gravel'
    else if (['compacted', 'fine_gravel', 'pebblestone'].includes(surface)) specs.floorSurface = 'uneven'
  }

  const tactile = t.tactile_paving?.toLowerCase()
  if (tactile === 'yes') specs.hasTactilePaving = true
  else if (tactile === 'no') specs.hasTactilePaving = false

  // ── Parking ───────────────────────────────────────────────────────
  const disParking = t['parking:disabled'] ?? t['disabled:parking'] ?? t['capacity:disabled']
  if (disParking && disParking !== '0' && disParking !== 'no') specs.hasDisabledParking = true
  else if (disParking === 'no' || disParking === '0') specs.hasDisabledParking = false

  // ── Extra OSM fields (display-only) ───────────────────────────────
  if (t['wheelchair:description']) extras.push({ label: 'OSM accessibility note', value: t['wheelchair:description'] })
  if (t.opening_hours) extras.push({ label: 'Opening hours', value: t.opening_hours })
  if (t.phone || t['contact:phone']) extras.push({ label: 'Phone', value: t.phone ?? t['contact:phone'] })
  if (t.website || t['contact:website']) extras.push({ label: 'Website', value: t.website ?? t['contact:website'] })
  if (t['addr:street']) {
    const addr = [t['addr:housenumber'], t['addr:street'], t['addr:city']].filter(Boolean).join(' ')
    extras.push({ label: 'Address (OSM)', value: addr })
  }
  const kerb = t.kerb ?? t['curb']
  if (kerb) extras.push({ label: 'Kerb type', value: kerb })
  if (t.level) extras.push({ label: 'Floor level', value: t.level })
  if (t.fee === 'no') extras.push({ label: 'Admission', value: 'Free entry' })
  else if (t.fee === 'yes') extras.push({ label: 'Admission', value: 'Paid entry' })

  return {
    osmId: `${el.type}/${el.id}`,
    specs,
    raw: t,
    extras,
  }
}
