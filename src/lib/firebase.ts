import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

// NOTE: the imports above are `import type` — they are erased at build time and
// pull ZERO runtime code. The actual Firebase SDK (~120 KB gzip) is loaded only
// on demand via dynamic import below, and only when a project is configured. In
// the default mock-data mode it never enters the bundle's initial load.

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** True when a real Firebase project is configured via env vars. */
export const FIREBASE_ENABLED = Boolean(config.apiKey && config.projectId)

type Services = { app: FirebaseApp; auth: Auth; db: Firestore; storage: FirebaseStorage }
let _init: Promise<Services> | null = null

/** Lazily import + initialise the Firebase SDK exactly once. */
function init(): Promise<Services> {
  if (!_init) {
    _init = (async () => {
      const [{ initializeApp }, { getAuth }, { getFirestore }, { getStorage }] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
        import('firebase/storage'),
      ])
      const app = initializeApp(config)
      return { app, auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) }
    })()
  }
  return _init
}

export async function getAuthInstance(): Promise<Auth | null> {
  if (!FIREBASE_ENABLED) return null
  return (await init()).auth
}
export async function getDb(): Promise<Firestore | null> {
  if (!FIREBASE_ENABLED) return null
  return (await init()).db
}
export async function getStorageInstance(): Promise<FirebaseStorage | null> {
  if (!FIREBASE_ENABLED) return null
  return (await init()).storage
}
