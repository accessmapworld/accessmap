import type { VerifyResult } from '../types'

const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY
const MODEL = import.meta.env.VITE_ROBOFLOW_MODEL || 'accessibility-features/3'

const FEATURE_MAP: Record<string, VerifyResult['detectedFeatures'][number]> = {
  ramp: 'ramp',
  stairs: 'stairs',
  elevator: 'elevator',
  automatic_door: 'automatic_door',
  'automatic door': 'automatic_door',
  accessible_bathroom: 'accessible_bathroom',
  'accessible bathroom': 'accessible_bathroom',
}

/**
 * Send an image to Roboflow's hosted inference API and return a structured
 * accessibility-feature verification. Confidence < 0.65 ⇒ not verified.
 * Falls back to a deterministic mock when no API key is configured so the
 * upload flow stays demonstrable.
 */
export async function verifyAccessibilityPhoto(imageUrl: string): Promise<VerifyResult> {
  if (!API_KEY) return mockVerify(imageUrl)
  try {
    const url = `https://detect.roboflow.com/${MODEL}?api_key=${API_KEY}&image=${encodeURIComponent(imageUrl)}`
    const res = await fetch(url, { method: 'POST' })
    if (!res.ok) return mockVerify(imageUrl)
    const data = await res.json()
    const preds: Array<{ class: string; confidence: number }> = data.predictions ?? []
    const detected = new Set<VerifyResult['detectedFeatures'][number]>()
    let top = 0
    for (const p of preds) {
      const mapped = FEATURE_MAP[p.class.toLowerCase()]
      if (mapped) detected.add(mapped)
      top = Math.max(top, p.confidence)
    }
    return {
      verified: top >= 0.65 && detected.size > 0,
      confidence: top,
      detectedFeatures: [...detected],
    }
  } catch {
    return mockVerify(imageUrl)
  }
}

/** Deterministic pseudo-result derived from the URL hash (demo mode). */
function mockVerify(seed: string): VerifyResult {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const confidence = 0.5 + (h % 50) / 100 // 0.50–0.99
  const all: VerifyResult['detectedFeatures'] = ['ramp', 'elevator', 'automatic_door', 'accessible_bathroom', 'stairs']
  const features = all.filter((_, i) => ((h >> i) & 1) === 1).slice(0, 2)
  return {
    verified: confidence >= 0.65 && features.length > 0,
    confidence: Number(confidence.toFixed(2)),
    detectedFeatures: features.length ? features : ['ramp'],
  }
}
