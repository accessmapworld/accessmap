import { FIREBASE_ENABLED, db } from './firebase'
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where,
  orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import type { Place, Review, Alert, AccessSpecs, Scores } from '../types'
import { mockPlaces, mockReviews, mockAlerts } from './mockData'
import { checkRate } from './rateLimit'

/* ------------------------------------------------------------------ *
 * Local store: keeps the UI fully functional without a backend.
 * Submissions persist to localStorage so they survive reloads.
 * ------------------------------------------------------------------ */
const LS_KEY = 'accessmap.local.v2'
type Local = { reviews: Review[]; alerts: Alert[]; places: Place[] }

function loadLocal(): Local {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Local>
      return { reviews: parsed.reviews ?? [...mockReviews], alerts: parsed.alerts ?? [...mockAlerts], places: parsed.places ?? [] }
    }
  } catch { /* ignore */ }
  return { reviews: [...mockReviews], alerts: [...mockAlerts], places: [] }
}
function saveLocal(l: Local) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(l)) } catch { /* ignore */ }
}
let local = typeof localStorage !== 'undefined' ? loadLocal() : { reviews: [...mockReviews], alerts: [...mockAlerts], places: [] as Place[] }
const uid = () => Math.random().toString(36).slice(2, 10)

const toMs = (v: unknown): number =>
  v instanceof Timestamp ? v.toMillis() : typeof v === 'number' ? v : Date.now()

/* ----------------------------- Places ----------------------------- */
export async function getPlaces(): Promise<Place[]> {
  if (!FIREBASE_ENABLED || !db) {
    // sponsored / self-listed businesses first
    return [...local.places, ...mockPlaces].sort((a, b) => Number(b.sponsored) - Number(a.sponsored))
  }
  const snap = await getDocs(collection(db, 'places'))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Place, 'id'>), lastUpdated: toMs(d.data().lastUpdated) }))
}

export async function getPlace(id: string): Promise<Place | null> {
  if (!FIREBASE_ENABLED || !db)
    return local.places.find((p) => p.id === id) ?? mockPlaces.find((p) => p.id === id) ?? null
  const d = await getDoc(doc(db, 'places', id))
  if (!d.exists()) return null
  return { id: d.id, ...(d.data() as Omit<Place, 'id'>), lastUpdated: toMs(d.data().lastUpdated) }
}

export async function addPlace(input: Omit<Place, 'id' | 'lastUpdated' | 'reviewCount'>): Promise<Place> {
  checkRate('listing', { minGapMs: 15000, maxPerHour: 8, label: 'business listing' })
  const base = { ...input, reviewCount: 0, lastUpdated: Date.now() }
  if (!FIREBASE_ENABLED || !db) {
    const place: Place = { ...base, id: 'biz-' + uid() }
    local.places.unshift(place)
    saveLocal(local)
    return place
  }
  const ref = await addDoc(collection(db, 'places'), { ...input, reviewCount: 0, lastUpdated: serverTimestamp() })
  return { ...base, id: ref.id }
}

/* ----------------------------- Reviews ---------------------------- */
export async function getReviews(placeId: string): Promise<Review[]> {
  if (!FIREBASE_ENABLED || !db)
    return local.reviews.filter((r) => r.placeId === placeId).sort((a, b) => b.createdAt - a.createdAt)
  const q = query(collection(db, 'places', placeId, 'reviews'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, placeId, ...(d.data() as Omit<Review, 'id' | 'placeId'>), createdAt: toMs(d.data().createdAt) }))
}

/* Review quality filter — silently hides low-quality or inappropriate content */
const BAD_PATTERNS = [
  /\b(fuck|shit|cunt|bitch|asshole|bastard|damn|hell|ass\b|dick|cock|pussy|whore|slut|nigger|nigga|faggot|retard)\b/i,
  /(.)\1{5,}/,        // spammy repeated chars e.g. "aaaaaaaa"
  /https?:\/\//i,     // links
  /\b(buy|sell|cheap|discount|promo|click here|visit us|order now|free money)\b/i, // spam
]

function reviewPasses(body: string, scores: Scores): boolean {
  if (BAD_PATTERNS.some(p => p.test(body))) return false
  if (body.trim().length < 20) return false
  // all scores at exactly 0 or all at 10 with no real text = likely spam
  const vals = Object.values(scores)
  const allSame = vals.every(v => v === vals[0])
  if (allSame && body.trim().length < 40) return false
  return true
}

export async function addReview(input: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<Review> {
  checkRate('review', { minGapMs: 8000, maxPerHour: 15, label: 'review' })
  const status: 'approved' | 'hidden' = reviewPasses(input.body, input.scores) ? 'approved' : 'hidden'
  const payload = { ...input, status }
  if (!FIREBASE_ENABLED || !db) {
    const review: Review = { ...payload, id: uid(), createdAt: Date.now() }
    local.reviews.unshift(review)
    saveLocal(local)
    return review
  }
  const ref = await addDoc(collection(db, 'places', input.placeId, 'reviews'), {
    ...payload, createdAt: serverTimestamp(),
  })
  return { ...payload, id: ref.id, createdAt: Date.now() }
}

export async function getHomeReviews(limit = 6): Promise<Review[]> {
  if (!FIREBASE_ENABLED || !db) {
    return local.reviews
      .filter(r => r.status === 'approved' && r.body.trim().length >= 20)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
  }
  // Firestore: collectionGroup across all places/reviews
  const { collectionGroup: cg, limit: fsLimit } = await import('firebase/firestore')
  const q = query(
    cg(db, 'reviews'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    fsLimit(limit),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({
    id: d.id,
    placeId: d.ref.parent.parent?.id ?? '',
    ...(d.data() as Omit<Review, 'id' | 'placeId'>),
    createdAt: toMs(d.data().createdAt),
  }))
}

/* ----------------------------- Alerts ----------------------------- */
export async function getAlerts(placeId?: string, onlyActive = true): Promise<Alert[]> {
  if (!FIREBASE_ENABLED || !db) {
    return local.alerts
      .filter((a) => (placeId ? a.placeId === placeId : true))
      .filter((a) => (onlyActive ? a.status === 'active' : true))
      .sort((a, b) => b.createdAt - a.createdAt)
  }
  const clauses = []
  if (placeId) clauses.push(where('placeId', '==', placeId))
  if (onlyActive) clauses.push(where('status', '==', 'active'))
  const q = query(collection(db, 'alerts'), ...clauses)
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Alert, 'id'>), createdAt: toMs(d.data().createdAt) }))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function addAlert(input: Omit<Alert, 'id' | 'createdAt' | 'status'>): Promise<Alert> {
  checkRate('report', { minGapMs: 8000, maxPerHour: 20, label: 'report' })
  if (!FIREBASE_ENABLED || !db) {
    const alert: Alert = { ...input, id: uid(), status: 'active', createdAt: Date.now() }
    local.alerts.unshift(alert)
    saveLocal(local)
    return alert
  }
  const ref = await addDoc(collection(db, 'alerts'), {
    ...input, status: 'active', createdAt: serverTimestamp(),
  })
  return { ...input, id: ref.id, status: 'active', createdAt: Date.now() }
}

export async function resolveAlert(id: string): Promise<void> {
  if (!FIREBASE_ENABLED || !db) {
    local.alerts = local.alerts.map((a) => (a.id === id ? { ...a, status: 'resolved', resolvedAt: Date.now() } : a))
    saveLocal(local)
    return
  }
  await updateDoc(doc(db, 'alerts', id), { status: 'resolved', resolvedAt: serverTimestamp() })
}

/* ----------------------------- Access Specs ----------------------- */
const LS_SPECS = 'accessmap.specs.v1'
function loadSpecs(): AccessSpecs[] {
  try { const r = localStorage.getItem(LS_SPECS); return r ? JSON.parse(r) : [] } catch { return [] }
}
function saveSpecs(s: AccessSpecs[]) { try { localStorage.setItem(LS_SPECS, JSON.stringify(s)) } catch { /* */ } }
let localSpecs: AccessSpecs[] = typeof localStorage !== 'undefined' ? loadSpecs() : []

export async function getSpecs(placeId: string): Promise<AccessSpecs[]> {
  if (!FIREBASE_ENABLED || !db) return localSpecs.filter(s => s.placeId === placeId).sort((a, b) => b.contributedAt - a.contributedAt)
  const q = query(collection(db, 'places', placeId, 'specs'), orderBy('contributedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AccessSpecs, 'id'>), contributedAt: toMs(d.data().contributedAt) }))
}

export async function addSpecs(input: Omit<AccessSpecs, 'id' | 'contributedAt'>): Promise<AccessSpecs> {
  checkRate('report', { minGapMs: 5000, maxPerHour: 20, label: 'spec contribution' })
  if (!FIREBASE_ENABLED || !db) {
    const s: AccessSpecs = { ...input, id: uid(), contributedAt: Date.now() }
    localSpecs.unshift(s)
    saveSpecs(localSpecs)
    return s
  }
  const ref = await addDoc(collection(db, 'places', input.placeId, 'specs'), { ...input, contributedAt: serverTimestamp() })
  return { ...input, id: ref.id, contributedAt: Date.now() }
}
