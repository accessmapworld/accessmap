/**
 * Seed Firestore with demo data.
 *
 *   1. cp .env.example .env  and fill in the VITE_FIREBASE_* values
 *   2. Temporarily relax Firestore rules (or run while signed in as admin)
 *   3. npm run seed         (uses Node's --env-file via the package script)
 *
 * Runs against the web SDK so no service-account key is required.
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
import { mockPlaces, mockReviews, mockAlerts } from '../lib/mockData'

const env = process.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY!,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: env.VITE_FIREBASE_APP_ID!,
}

if (!config.apiKey || !config.projectId) {
  console.error('Missing Firebase env vars. Run: tsx --env-file=.env src/scripts/seed.ts')
  process.exit(1)
}

const db = getFirestore(initializeApp(config))

async function run() {
  for (const p of mockPlaces) {
    const { id, ...rest } = p
    await setDoc(doc(db, 'places', id), { ...rest, lastUpdated: serverTimestamp() })
    console.log('place →', p.name)
  }
  for (const r of mockReviews) {
    const { id, placeId, ...rest } = r
    await setDoc(doc(collection(db, 'places', placeId, 'reviews'), id), { ...rest, createdAt: serverTimestamp() })
  }
  for (const a of mockAlerts) {
    const { id, ...rest } = a
    await setDoc(doc(db, 'alerts', id), { ...rest, createdAt: serverTimestamp() })
  }
  console.log(`Seeded ${mockPlaces.length} places, ${mockReviews.length} reviews, ${mockAlerts.length} alerts.`)
  process.exit(0)
}
run().catch((e) => { console.error(e); process.exit(1) })
