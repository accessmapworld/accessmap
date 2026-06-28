import { create } from 'zustand'
import { getAuthInstance, FIREBASE_ENABLED } from '../lib/firebase'
import type { AppUser, FilterKey, NeedsProfile } from '../types'
import { DEFAULT_PROFILE } from '../lib/compatibility'

interface AppState {
  user: AppUser | null
  authReady: boolean
  filters: Set<FilterKey>
  easyMode: boolean
  needsProfile: NeedsProfile
  toggleFilter: (f: FilterKey) => void
  clearFilters: () => void
  toggleSaved: (placeId: string) => void
  toggleEasyMode: () => void
  setNeedsProfile: (p: NeedsProfile) => void
  initAuth: () => void
  signInGoogle: () => Promise<void>
  signInEmail: (email: string, pw: string, name?: string, register?: boolean) => Promise<void>
  logout: () => Promise<void>
}


function loadEasyMode(): boolean {
  try { return localStorage.getItem('am.easyMode') === '1' } catch { return false }
}

function applyEasyMode(on: boolean) {
  document.documentElement.classList.toggle('a11y-mode', on)
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  authReady: false,
  filters: new Set(),
  easyMode: (() => { const v = loadEasyMode(); applyEasyMode(v); return v })(),
  needsProfile: (() => { try { const r = localStorage.getItem('am.needs'); return r ? JSON.parse(r) : DEFAULT_PROFILE } catch { return DEFAULT_PROFILE } })(),

  setNeedsProfile: (p) => {
    try { localStorage.setItem('am.needs', JSON.stringify(p)) } catch { /* */ }
    set({ needsProfile: p })
  },

  toggleEasyMode: () =>
    set((s) => {
      const next = !s.easyMode
      applyEasyMode(next)
      try { localStorage.setItem('am.easyMode', next ? '1' : '0') } catch { /* */ }
      return { easyMode: next }
    }),

  toggleFilter: (f) =>
    set((s) => {
      const next = new Set(s.filters)
      next.has(f) ? next.delete(f) : next.add(f)
      return { filters: next }
    }),
  clearFilters: () => set({ filters: new Set() }),

  toggleSaved: (placeId) =>
    set((s) => {
      if (!s.user) return s
      const saved = s.user.savedPlaces.includes(placeId)
        ? s.user.savedPlaces.filter((id) => id !== placeId)
        : [...s.user.savedPlaces, placeId]
      return { user: { ...s.user, savedPlaces: saved } }
    }),

  initAuth: () => {
    if (!FIREBASE_ENABLED) {
      set({ authReady: true })
      return
    }
    // Auth SDK loads lazily — never blocks first paint.
    void (async () => {
      const auth = await getAuthInstance()
      if (!auth) { set({ authReady: true }); return }
      const { onAuthStateChanged } = await import('firebase/auth')
      onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          set({
            user: {
              uid: fbUser.uid,
              displayName: fbUser.displayName || fbUser.email || 'User',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
              role: 'user',
              premium: false,
              savedPlaces: [],
              reviewCount: 0,
              reportCount: 0,
            },
            authReady: true,
          })
        } else {
          set({ user: null, authReady: true })
        }
      })
    })()
  },

  signInGoogle: async () => {
    const auth = await getAuthInstance()
    if (!auth) throw new Error('Firebase is not configured.')
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    await signInWithPopup(auth, new GoogleAuthProvider())
  },

  signInEmail: async (email, pw, _name, register) => {
    const auth = await getAuthInstance()
    if (!auth) throw new Error('Firebase is not configured.')
    const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth')
    if (register) await createUserWithEmailAndPassword(auth, email, pw)
    else await signInWithEmailAndPassword(auth, email, pw)
  },

  logout: async () => {
    if (FIREBASE_ENABLED) {
      const auth = await getAuthInstance()
      if (auth) {
        const { signOut } = await import('firebase/auth')
        await signOut(auth)
      }
    }
    set({ user: null })
  },
}))

export const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: 'wheelchair', label: 'Wheelchair' },
  { key: 'quiet', label: 'Quiet Space' },
  { key: 'elevator', label: 'Elevator' },
  { key: 'braille', label: 'Braille' },
  { key: 'sign', label: 'Sign Language' },
  { key: 'hearingloop', label: 'Hearing Loop' },
]
