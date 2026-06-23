import { create } from 'zustand'
import {
  GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth'
import { auth, FIREBASE_ENABLED } from '../lib/firebase'
import type { AppUser, FilterKey } from '../types'

interface AppState {
  user: AppUser | null
  authReady: boolean
  filters: Set<FilterKey>
  toggleFilter: (f: FilterKey) => void
  clearFilters: () => void
  toggleSaved: (placeId: string) => void
  initAuth: () => void
  signInGoogle: () => Promise<void>
  signInEmail: (email: string, pw: string, name?: string, register?: boolean) => Promise<void>
  logout: () => Promise<void>
}

const MOCK_USER: AppUser = {
  uid: 'demo-admin',
  displayName: 'Demo Admin',
  email: 'demo@accessmap.app',
  role: 'admin',
  premium: true,
  savedPlaces: ['getty-la', 'central-park-vc-nyc'],
  reviewCount: 4,
  reportCount: 1,
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  authReady: false,
  filters: new Set(),

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
    if (!FIREBASE_ENABLED || !auth) {
      set({ authReady: true })
      return
    }
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
  },

  signInGoogle: async () => {
    if (!FIREBASE_ENABLED || !auth) {
      set({ user: MOCK_USER })
      return
    }
    await signInWithPopup(auth, new GoogleAuthProvider())
  },

  signInEmail: async (email, pw, name, register) => {
    if (!FIREBASE_ENABLED || !auth) {
      set({ user: { ...MOCK_USER, displayName: name || email.split('@')[0], email, role: 'user', premium: false } })
      return
    }
    if (register) await createUserWithEmailAndPassword(auth, email, pw)
    else await signInWithEmailAndPassword(auth, email, pw)
  },

  logout: async () => {
    if (FIREBASE_ENABLED && auth) await signOut(auth)
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
