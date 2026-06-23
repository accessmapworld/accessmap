import {
  Utensils, Coffee, Hotel, Cross, Pill, GraduationCap, ShoppingBag,
  Landmark, TreePine, Banknote, type LucideIcon,
} from 'lucide-react'

export interface Poi {
  id: string
  name: string
  lat: number
  lng: number
  category: CategoryKey
  address?: string
}

export type CategoryKey =
  | 'restaurant' | 'cafe' | 'hotel' | 'hospital' | 'pharmacy'
  | 'school' | 'shop' | 'park' | 'bank' | 'attraction'

export const CATEGORIES: { key: CategoryKey; label: string; icon: LucideIcon; selector: string; color: string }[] = [
  { key: 'restaurant', label: 'Restaurants', icon: Utensils, selector: '["amenity"="restaurant"]', color: '#ea4335' },
  { key: 'cafe', label: 'Coffee', icon: Coffee, selector: '["amenity"="cafe"]', color: '#f29900' },
  { key: 'hotel', label: 'Hotels', icon: Hotel, selector: '["tourism"="hotel"]', color: '#1a73e8' },
  { key: 'hospital', label: 'Hospitals', icon: Cross, selector: '["amenity"="hospital"]', color: '#d33b8f' },
  { key: 'pharmacy', label: 'Pharmacies', icon: Pill, selector: '["amenity"="pharmacy"]', color: '#1e8e3e' },
  { key: 'shop', label: 'Shopping', icon: ShoppingBag, selector: '["shop"]', color: '#9334e6' },
  { key: 'school', label: 'Schools', icon: GraduationCap, selector: '["amenity"="school"]', color: '#e37400' },
  { key: 'attraction', label: 'Attractions', icon: Landmark, selector: '["tourism"="attraction"]', color: '#12b5cb' },
  { key: 'park', label: 'Parks', icon: TreePine, selector: '["leisure"="park"]', color: '#34a853' },
  { key: 'bank', label: 'ATMs & Banks', icon: Banknote, selector: '["amenity"="bank"]', color: '#5f6368' },
]

export const categoryColor = (k: CategoryKey): string =>
  CATEGORIES.find((c) => c.key === k)?.color ?? '#ea4335'

/** Find POIs of a category within `radius` metres of a center point. */
export async function nearbyByCategory(
  center: [number, number],
  category: CategoryKey,
  radius = 2000,
  signal?: AbortSignal,
): Promise<Poi[]> {
  const cat = CATEGORIES.find((c) => c.key === category)
  if (!cat) return []
  const [lat, lng] = center
  const q = `
    [out:json][timeout:25];
    (
      node${cat.selector}["name"](around:${radius},${lat},${lng});
      way${cat.selector}["name"](around:${radius},${lat},${lng});
    );
    out center 50;`
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
    out.push({
      id: `${el.type}-${el.id}`,
      name: el.tags.name,
      lat: plat,
      lng: plng,
      category,
      address: [el.tags['addr:housenumber'], el.tags['addr:street']].filter(Boolean).join(' ') || undefined,
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
