/** Google Maps deep links (open in app on mobile, web otherwise). */
export function googleMapsDir(
  origin: [number, number],
  dest: [number, number],
  mode: 'walking' | 'driving' | 'transit' = 'walking',
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${dest[0]},${dest[1]}&travelmode=${mode}`
}

/** Directions to a place from the user's current location. */
export function googleMapsTo(
  dest: [number, number],
  mode: 'walking' | 'driving' | 'transit' = 'walking',
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${dest[0]},${dest[1]}&travelmode=${mode}`
}
