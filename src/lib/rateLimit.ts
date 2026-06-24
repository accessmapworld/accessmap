/**
 * Lightweight client-side rate limiting.
 *
 * `spaced` enforces a minimum gap between outbound calls to a shared key so we
 * stay within third-party usage policies (Nominatim ≈1 req/s, Overpass, OSRM).
 *
 * `checkRate` throttles user actions (reviews / reports / listings) to curb
 * spam — it throws a RateLimitError that the forms surface to the user.
 */

const lastAt: Record<string, number> = {}

/** Resolve after ensuring at least `ms` since the previous call for `key`. */
export function spaced(key: string, ms: number): Promise<void> {
  const now = Date.now()
  const prev = lastAt[key] ?? 0
  const wait = Math.max(0, prev + ms - now)
  lastAt[key] = now + wait
  return new Promise((r) => setTimeout(r, wait))
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}

interface RateOpts {
  minGapMs?: number // minimum time between actions
  maxPerHour?: number // rolling hourly cap
  label?: string // noun used in the error message
}

/** Throws RateLimitError when the action for `key` is over its limit. */
export function checkRate(key: string, { minGapMs = 6000, maxPerHour = 15, label = 'action' }: RateOpts = {}): void {
  const storeKey = `am.rl.${key}`
  let times: number[] = []
  try {
    times = JSON.parse(localStorage.getItem(storeKey) || '[]')
  } catch { times = [] }

  const now = Date.now()
  times = times.filter((t) => now - t < 3600_000) // keep last hour

  const last = times[times.length - 1]
  if (last && now - last < minGapMs) {
    const secs = Math.ceil((minGapMs - (now - last)) / 1000)
    throw new RateLimitError(`Slow down — please wait ${secs}s before your next ${label}.`)
  }
  if (times.length >= maxPerHour) {
    throw new RateLimitError(`You've hit the hourly limit for this ${label}. Try again later.`)
  }

  times.push(now)
  try { localStorage.setItem(storeKey, JSON.stringify(times)) } catch { /* ignore */ }
}
