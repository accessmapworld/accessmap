import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

/**
 * Global connection indicator. When the browser goes offline it shows a
 * persistent banner explaining that saved data is being used; when the
 * connection returns it briefly confirms before hiding. Announced to
 * assistive tech via aria-live so the state change isn't silent.
 */
export default function ConnectionStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    const goOffline = () => { setOnline(false); setJustReconnected(false) }
    const goOnline = () => {
      setOnline(true)
      setJustReconnected(true)
      const t = setTimeout(() => setJustReconnected(false), 3500)
      return () => clearTimeout(t)
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (online && !justReconnected) return null

  return (
    <div
      role="status"
      aria-live="assertive"
      className={`fixed inset-x-0 top-0 z-[1000] flex items-center justify-center gap-2 px-4 py-2 text-center text-sm font-medium text-white ${
        online ? 'bg-[#1e8e3e]' : 'bg-[#5f6368]'
      }`}
    >
      {online ? (
        <>
          <Wifi size={16} aria-hidden="true" />
          Back online
        </>
      ) : (
        <>
          <WifiOff size={16} aria-hidden="true" />
          You're offline — showing saved places. New data will sync when you reconnect.
        </>
      )}
    </div>
  )
}
