import type { Place } from '../types'
import type { NeedsProfile, CompatibilityResult } from '../types'
import type { Poi } from './overpass'

export const DEFAULT_PROFILE: NeedsProfile = {
  mobility: 'none',
  hearing: 'none',
  vision: 'none',
  sensory: 'none',
  needsLift: false,
  needsAccessibleToilet: false,
  needsHearingLoop: false,
  needsTactile: false,
  needsQuietSpace: false,
}

export function hasProfile(p: NeedsProfile): boolean {
  return (
    p.mobility !== 'none' ||
    p.hearing !== 'none' ||
    p.vision !== 'none' ||
    p.sensory !== 'none' ||
    p.needsLift ||
    p.needsAccessibleToilet ||
    p.needsHearingLoop ||
    p.needsTactile ||
    p.needsQuietSpace
  )
}

/** Score a Place against a user's NeedsProfile. Returns 0–100 + grade + warnings/highlights. */
export function scorePlace(place: Place, profile: NeedsProfile): CompatibilityResult {
  const warnings: string[] = []
  const highlights: string[] = []
  const features = (place.features ?? []).map((f) => f.toLowerCase())

  let total = 0
  let weight = 0

  // ── Mobility ──────────────────────────────────────────────────────
  if (profile.mobility !== 'none') {
    const mobilityScore = place.scores.mobility
    const w = profile.mobility === 'power_wheelchair' || profile.mobility === 'scooter' ? 3 : 2
    total += mobilityScore * 10 * w
    weight += 100 * w

    if (mobilityScore >= 8) highlights.push('Excellent wheelchair access')
    else if (mobilityScore <= 4) warnings.push('Poor wheelchair / mobility access reported')

    if (profile.mobility === 'power_wheelchair' || profile.mobility === 'scooter') {
      const terrain = place.terrainRating ?? 1
      if (terrain >= 4) warnings.push('Rough terrain — may be difficult for power wheelchair or scooter')
      else if (terrain <= 2) highlights.push('Smooth, flat terrain')
    }

    if (profile.needsLift) {
      const hasLift = features.some((f) => f.includes('elevator') || f.includes('lift'))
      if (hasLift) highlights.push('Elevator / lift available')
      else warnings.push('No elevator or lift confirmed — check before visiting')
    }

    if (profile.needsAccessibleToilet) {
      const hasToilet = features.some((f) => f.includes('accessible toilet') || f.includes('wheelchair toilet'))
      if (hasToilet) highlights.push('Accessible toilet confirmed')
      else warnings.push('Accessible toilet not confirmed — call ahead to verify')
    }
  }

  // ── Hearing ───────────────────────────────────────────────────────
  if (profile.hearing !== 'none') {
    const hearingScore = place.scores.hearing
    const w = profile.hearing === 'deaf' ? 3 : 2
    total += hearingScore * 10 * w
    weight += 100 * w

    if (hearingScore >= 8) highlights.push('Great hearing accessibility')
    else if (hearingScore <= 4) warnings.push('Limited hearing accessibility reported')

    if (profile.needsHearingLoop) {
      const hasLoop = features.some((f) => f.includes('hearing loop') || f.includes('induction loop') || f.includes('t-loop'))
      if (hasLoop) highlights.push('Hearing loop / induction loop available')
      else warnings.push('No hearing loop confirmed at this location')
    }
  }

  // ── Vision ────────────────────────────────────────────────────────
  if (profile.vision !== 'none') {
    const visionScore = place.scores.vision
    const w = profile.vision === 'blind' ? 3 : 2
    total += visionScore * 10 * w
    weight += 100 * w

    if (visionScore >= 8) highlights.push('Good visual accessibility and wayfinding')
    else if (visionScore <= 4) warnings.push('Limited visual accessibility reported')

    if (profile.needsTactile) {
      const hasTactile = features.some((f) => f.includes('tactile') || f.includes('braille'))
      if (hasTactile) highlights.push('Tactile paving / Braille signage present')
      else warnings.push('No tactile paving or Braille signage confirmed')
    }
  }

  // ── Sensory ───────────────────────────────────────────────────────
  if (profile.sensory !== 'none') {
    const sensoryScore = place.scores.sensory
    const w = profile.sensory === 'severe' ? 3 : 2
    total += sensoryScore * 10 * w
    weight += 100 * w

    if (sensoryScore >= 8) highlights.push('Low-stimulation, sensory-friendly environment')
    else if (sensoryScore <= 4) warnings.push('Can be loud or visually overwhelming')

    if (profile.needsQuietSpace) {
      const hasQuiet = features.some((f) => f.includes('quiet') || f.includes('low noise') || f.includes('calm'))
      if (hasQuiet) highlights.push('Quiet / low-stimulation space available')
      else if (sensoryScore <= 5) warnings.push('No quiet space confirmed — may be noisy or busy')
    }
  }

  // Fallback: if profile has no specific needs set, return neutral
  if (weight === 0) return { score: 0, grade: 'good', warnings: [], highlights: [] }

  const score = Math.round(total / weight)
  const grade: CompatibilityResult['grade'] =
    score >= 80 ? 'great' : score >= 60 ? 'good' : score >= 40 ? 'limited' : 'poor'

  return { score, grade, warnings, highlights }
}

/** Score a POI (from Overpass) against a profile. Simpler — uses what OSM gives us. */
export function scorePoi(poi: Poi, profile: NeedsProfile): CompatibilityResult {
  const warnings: string[] = []
  const highlights: string[] = []

  let total = 0
  let weight = 0

  if (profile.mobility !== 'none') {
    const base = poi.accessScore ?? 5
    total += base * 10 * 2
    weight += 100 * 2
    if (base >= 8) highlights.push('Wheelchair accessible confirmed')
    else if (base <= 4) warnings.push('Limited or no wheelchair access')

    if ((profile.mobility === 'power_wheelchair' || profile.mobility === 'scooter') && poi.terrain === 'Rough') {
      warnings.push('Rough terrain — difficult for powered mobility aids')
    }
    if (profile.needsAccessibleToilet && poi.accessibleToilet) highlights.push('Accessible toilet available')
    else if (profile.needsAccessibleToilet && !poi.accessibleToilet) warnings.push('No accessible toilet confirmed')
  }

  if (profile.vision !== 'none' && profile.needsTactile) {
    if (poi.tactile) highlights.push('Tactile paving present')
    else warnings.push('No tactile paving confirmed')
  }

  if (weight === 0) return { score: 0, grade: 'good', warnings: [], highlights: [] }

  const score = Math.round(total / weight)
  const grade: CompatibilityResult['grade'] =
    score >= 80 ? 'great' : score >= 60 ? 'good' : score >= 40 ? 'limited' : 'poor'

  return { score, grade, warnings, highlights }
}

export const GRADE_COLOR: Record<CompatibilityResult['grade'], string> = {
  great: '#16a34a',
  good: '#0ABFBF',
  limited: '#f97316',
  poor: '#dc2626',
}

export const GRADE_LABEL: Record<CompatibilityResult['grade'], string> = {
  great: 'Great match',
  good: 'Good match',
  limited: 'Limited match',
  poor: 'Poor match',
}
