import { useEffect, useState } from 'react'

/**
 * A clock that ticks on an interval so relative timestamps ("2m ago")
 * stay live without a manual refresh. Default cadence is 30s.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}
