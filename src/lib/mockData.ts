import type { Place, Review, Alert } from '../types'

const now = Date.now()
const hrs = (n: number) => now - n * 3600_000

export const mockPlaces: Place[] = [
  { id: 'union-station-chi', name: 'Union Station Chicago', address: '225 S Canal St, Chicago, IL', city: 'Chicago', lat: 41.8786, lng: -87.6397, scores: { mobility: 8, sensory: 5, hearing: 6, vision: 7 }, reviewCount: 3, lastUpdated: hrs(5) },
  { id: 'art-institute-chi', name: 'Art Institute of Chicago', address: '111 S Michigan Ave, Chicago, IL', city: 'Chicago', lat: 41.8796, lng: -87.6237, scores: { mobility: 9, sensory: 7, hearing: 8, vision: 8 }, reviewCount: 3, lastUpdated: hrs(20) },
  { id: 'central-park-vc-nyc', name: 'Central Park Visitor Center', address: '14 E 60th St, New York, NY', city: 'New York', lat: 40.7681, lng: -73.9712, scores: { mobility: 7, sensory: 8, hearing: 5, vision: 6 }, reviewCount: 3, lastUpdated: hrs(2) },
  { id: 'grand-central-nyc', name: 'Grand Central Terminal', address: '89 E 42nd St, New York, NY', city: 'New York', lat: 40.7527, lng: -73.9772, scores: { mobility: 6, sensory: 3, hearing: 6, vision: 7 }, reviewCount: 3, lastUpdated: hrs(1) },
  { id: 'getty-la', name: 'The Getty Center', address: '1200 Getty Center Dr, Los Angeles, CA', city: 'Los Angeles', lat: 34.0780, lng: -118.4741, scores: { mobility: 10, sensory: 8, hearing: 9, vision: 9 }, reviewCount: 3, lastUpdated: hrs(30) },
  { id: 'union-station-la', name: 'Los Angeles Union Station', address: '800 N Alameda St, Los Angeles, CA', city: 'Los Angeles', lat: 34.0560, lng: -118.2365, scores: { mobility: 7, sensory: 5, hearing: 5, vision: 6 }, reviewCount: 3, lastUpdated: hrs(8) },
  { id: 'british-museum-ldn', name: 'The British Museum', address: 'Great Russell St, London', city: 'London', lat: 51.5194, lng: -0.1270, scores: { mobility: 8, sensory: 6, hearing: 7, vision: 8 }, reviewCount: 3, lastUpdated: hrs(12) },
  { id: 'kings-cross-ldn', name: "King's Cross Station", address: 'Euston Rd, London', city: 'London', lat: 51.5320, lng: -0.1233, scores: { mobility: 9, sensory: 4, hearing: 7, vision: 7 }, reviewCount: 3, lastUpdated: hrs(3) },
  { id: 'tokyo-station', name: 'Tokyo Station', address: '1 Chome Marunouchi, Chiyoda City, Tokyo', city: 'Tokyo', lat: 35.6812, lng: 139.7671, scores: { mobility: 9, sensory: 4, hearing: 6, vision: 9 }, reviewCount: 3, lastUpdated: hrs(6) },
  { id: 'teamlab-tokyo', name: 'teamLab Planets TOKYO', address: '6 Chome-1-16 Toyosu, Koto City, Tokyo', city: 'Tokyo', lat: 35.6494, lng: 139.7906, scores: { mobility: 5, sensory: 2, hearing: 4, vision: 3 }, reviewCount: 3, lastUpdated: hrs(15) },
]

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
