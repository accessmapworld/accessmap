export interface Scores {
  mobility: number // 0-10
  sensory: number
  hearing: number
  vision: number
}

export type Dimension = keyof Scores

export interface Place {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  scores: Scores
  reviewCount: number
  lastUpdated: number // epoch ms
  osmId?: string
  city?: string
  category?: string
  sponsored?: boolean   // featured / advertised listing
  selfListed?: boolean  // added by the business owner
  features?: string[]   // self-reported accessibility features
  contact?: string
  terrainRating?: number  // 1-5: 1=flat/paved, 5=very rough/steep
  trailDifficulty?: 'easy' | 'moderate' | 'hard' | 'expert'
}

export interface Review {
  id: string
  placeId: string
  userId: string
  userName: string
  userPhoto?: string
  scores: Scores
  body: string
  photos: string[]
  verified: boolean
  createdAt: number
}

export type AlertType =
  | 'elevator'
  | 'ramp'
  | 'bathroom'
  | 'noise'
  | 'obstruction'
  | 'other'

export interface Alert {
  id: string
  placeId: string
  type: AlertType
  description: string
  reportedBy: string
  photoUrl?: string
  aiVerified: boolean
  aiConfidence?: number
  status: 'active' | 'resolved'
  createdAt: number
  resolvedAt?: number
}

export interface AppUser {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  role: 'user' | 'admin'
  premium: boolean
  savedPlaces: string[]
  reviewCount: number
  reportCount: number
}

export type FilterKey =
  | 'wheelchair'
  | 'quiet'
  | 'elevator'
  | 'braille'
  | 'sign'
  | 'hearingloop'

export interface NeedsProfile {
  mobility: 'none' | 'cane' | 'manual_wheelchair' | 'power_wheelchair' | 'scooter'
  hearing: 'none' | 'hard_of_hearing' | 'deaf'
  vision: 'none' | 'low_vision' | 'blind'
  sensory: 'none' | 'sensitive' | 'severe'
  // specific feature needs
  needsLift: boolean
  needsAccessibleToilet: boolean
  needsHearingLoop: boolean
  needsTactile: boolean
  needsQuietSpace: boolean
}

export interface CompatibilityResult {
  score: number          // 0–100
  grade: 'great' | 'good' | 'limited' | 'poor'
  warnings: string[]     // specific issues for this user
  highlights: string[]   // specific positives for this user
}

export interface VerifyResult {
  verified: boolean
  confidence: number
  detectedFeatures: (
    | 'ramp'
    | 'stairs'
    | 'elevator'
    | 'automatic_door'
    | 'accessible_bathroom'
  )[]
}
