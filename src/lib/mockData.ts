import type { Place, Review, Alert } from '../types'

const now = Date.now()
const hrs = (n: number) => now - n * 3600_000

export const mockPlaces: Place[] = []

const r = (placeId: string, idx: number, userName: string, s: Review['scores'], body: string, h: number, verified = false): Review => ({
  id: `${placeId}-r${idx}`, placeId, userId: `u${idx}`, userName, scores: s, body, photos: [], verified, createdAt: hrs(h),
})

export const mockReviews: Review[] = [
  r('union-station-chi', 1, 'Maya R.', { mobility: 8, sensory: 5, hearing: 6, vision: 7 }, 'Great elevators near the Great Hall but the south entrance ramp is steep. Plenty of accessible bathrooms on the main concourse.', 6, true),
  r('union-station-chi', 2, 'Devon K.', { mobility: 7, sensory: 4, hearing: 6, vision: 7 }, 'Crowded at rush hour and the acoustics make announcements hard to follow. Staff were very helpful with directions though.', 30),
  r('union-station-chi', 3, 'Priya S.', { mobility: 9, sensory: 6, hearing: 7, vision: 8 }, 'Tactile paving leading to the platforms is excellent. Automatic doors at every main entrance.', 72, true),
  r('central-park-vc-nyc', 1, 'Sam W.', { mobility: 7, sensory: 8, hearing: 5, vision: 6 }, 'Calm, well-lit space with seating. No hearing loop at the info desk which was a miss for me.', 4),
  r('central-park-vc-nyc', 2, 'Lena M.', { mobility: 8, sensory: 8, hearing: 5, vision: 6 }, 'Step-free entry and a quiet room off to the side. Loved how low-stimulation it felt.', 26, true),
  r('central-park-vc-nyc', 3, 'Theo B.', { mobility: 6, sensory: 7, hearing: 4, vision: 6 }, 'Ramp at the side entrance is a little narrow for power chairs but doable.', 50),
  r('grand-central-nyc', 1, 'Aiko T.', { mobility: 6, sensory: 3, hearing: 6, vision: 7 }, 'Beautiful but LOUD. The main concourse is overwhelming. Elevators exist but are hard to find.', 1),
  r('grand-central-nyc', 2, 'Marcus L.', { mobility: 6, sensory: 2, hearing: 6, vision: 7 }, 'Signage is good for low vision. Sensory overload is real during peak hours.', 18),
  r('grand-central-nyc', 3, 'Nora P.', { mobility: 7, sensory: 4, hearing: 6, vision: 8 }, 'Found the accessible route to the subway eventually — ask the station agents.', 40),
]

export const mockAlerts: Alert[] = [
  { id: 'a1', placeId: 'grand-central-nyc', type: 'elevator', description: 'Elevator to the lower dining concourse is offline — engineers on site.', reportedBy: 'Aiko T.', aiVerified: true, aiConfidence: 0.82, status: 'active', createdAt: hrs(2) },
  { id: 'a2', placeId: 'union-station-chi', type: 'ramp', description: 'South entrance ramp blocked by construction barriers. Use the Canal St ramp instead.', reportedBy: 'Devon K.', aiVerified: false, aiConfidence: 0.41, status: 'active', createdAt: hrs(5) },
]
