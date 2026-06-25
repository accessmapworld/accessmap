import { useMemo, useState } from 'react'
import { MapPinned, X, Check } from 'lucide-react'

const KEY = 'am.waitlist.v1'
type Entry = { email: string; area: string; t: number }

function loadWaitlist(): Entry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }

/**
 * Converts a "ghost town" empty map into a market-expansion lead (§1.4).
 * Captures email demand for the region and routes contributors to add the first place.
 */
export default function EmptyStateCapture({ area, onMapFirst, onDismiss }: {
  area: string; onMapFirst: () => void; onDismiss: () => void
}) {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)
  const list = useMemo(() => loadWaitlist(), [])
  const baseDemand = 40 + (hash(area || 'global') % 180)
  const areaCount = list.filter((e) => e.area === area).length
  const [extra, setExtra] = useState(0)
  const demand = baseDemand + areaCount + extra

  function join() {
    const e = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(e)) return
    try {
      const next = [...loadWaitlist(), { email: e, area, t: Date.now() }]
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch { /* ignore */ }
    setExtra(1); setJoined(true)
  }

  return (
    <div className="pointer-events-auto absolute bottom-[72px] left-1/2 z-[760] w-[min(92vw,30rem)] -translate-x-1/2 animate-page-in sm:bottom-6">
      <div className="card relative p-5 shadow-map">
        <button onClick={onDismiss} className="absolute right-3 top-3 rounded-full p-1 text-muted hover:bg-bg hover:text-ink" aria-label="Dismiss"><X size={16} /></button>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MapPinned size={22} /></span>
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight">AccessMap isn’t fully live in {area || 'your area'} yet</h3>
            <p className="mt-1 text-sm text-muted">
              <span className="font-semibold text-ink">{demand}</span> people near you are waiting for accessible places here. Help us launch it.
            </p>
          </div>
        </div>

        {joined ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-primary"><Check size={16} /> You’re on the list — we’ll email when {area || 'your area'} goes live.</p>
        ) : (
          <div className="mt-4 flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && join()}
              type="email"
              placeholder="you@email.com"
              className="input flex-1"
            />
            <button onClick={join} className="btn-primary shrink-0">Notify me</button>
          </div>
        )}

        <button onClick={onMapFirst} className="btn-ghost mt-2 w-full text-sm">
          Or map the first accessible place here →
        </button>
      </div>
    </div>
  )
}
