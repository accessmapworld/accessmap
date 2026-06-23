/**
 * Pull real-world wheelchair-accessible POIs from the OpenStreetMap Overpass
 * API and upsert them as Place documents. Gives the map real seed data before
 * any users contribute.
 *
 *   tsx --env-file=.env src/scripts/osm-seed.ts "Chicago"
 *   tsx --env-file=.env src/scripts/osm-seed.ts "NYC"
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

// bounding boxes: [south, west, north, east]
const BBOX: Record<string, [number, number, number, number]> = {
  Chicago: [41.80, -87.74, 41.99, -87.52],
  NYC: [40.68, -74.05, 40.85, -73.90],
}

const env = process.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY!, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: env.VITE_FIREBASE_PROJECT_ID!, storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID!, appId: env.VITE_FIREBASE_APP_ID!,
}

const city = process.argv[2] ?? 'Chicago'
const bbox = BBOX[city]
if (!bbox) { console.error('Unknown city. Try: Chicago | NYC'); process.exit(1) }
if (!config.projectId) { console.error('Missing Firebase env. Use tsx --env-file=.env …'); process.exit(1) }

const db = getFirestore(initializeApp(config))

const mobilityFromTag = (w?: string): number | null =>
  w === 'yes' ? 8 : w === 'limited' ? 5 : null

async function run() {
  const [s, w, n, e] = bbox
  const query = `
    [out:json][timeout:60];
    (
      node["wheelchair"~"yes|limited"]["name"](${s},${w},${n},${e});
      way["wheelchair"~"yes|limited"]["name"](${s},${w},${n},${e});
    );
    out center 80;`
  console.log(`Querying Overpass for ${city}…`)
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: 'data=' + encodeURIComponent(query),
  })
  const data = await res.json()
  let created = 0
  for (const el of data.elements as any[]) {
    const lat = el.lat ?? el.center?.lat
    const lng = el.lon ?? el.center?.lon
    if (!lat || !lng || !el.tags?.name) continue
    const id = `osm-${el.type}-${el.id}`
    if ((await getDoc(doc(db, 'places', id))).exists()) continue
    const mobility = mobilityFromTag(el.tags.wheelchair)
    await setDoc(doc(db, 'places', id), {
      name: el.tags.name,
      address: [el.tags['addr:street'], city].filter(Boolean).join(', ') || city,
      lat, lng, city,
      osmId: `${el.type}/${el.id}`,
      scores: { mobility: mobility ?? 0, sensory: 0, hearing: 0, vision: 0 },
      reviewCount: 0,
      lastUpdated: serverTimestamp(),
    })
    created++
  }
  console.log(`Upserted ${created} OSM places for ${city}.`)
  process.exit(0)
}
run().catch((e) => { console.error(e); process.exit(1) })
