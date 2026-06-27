import { useEffect, useRef, useState } from 'react'

/* Web Speech API recognition isn't in the standard TS DOM lib and is vendor
 * prefixed in some browsers, so we access it loosely. */
const SR: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined

export const voiceSearchSupported = Boolean(SR)

/**
 * Hook for hands-free / voice search. Calls `onResult` with the recognised
 * transcript. Returns `listening` state and start/stop/toggle controls.
 * No-ops gracefully when the browser has no speech recognition.
 */
export function useVoiceSearch(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const recRef = useRef<any>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  function stop() {
    try { recRef.current?.stop() } catch { /* ignore */ }
    recRef.current = null
    setListening(false)
  }

  function start() {
    if (!SR || recRef.current) return
    const rec = new SR()
    rec.lang = document.documentElement.lang || 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript?.trim() ?? ''
      if (transcript) onResultRef.current(transcript)
    }
    rec.onerror = () => { recRef.current = null; setListening(false) }
    rec.onend = () => { recRef.current = null; setListening(false) }
    recRef.current = rec
    setListening(true)
    try { rec.start() } catch { recRef.current = null; setListening(false) }
  }

  useEffect(() => () => stop(), [])

  return {
    supported: voiceSearchSupported,
    listening,
    start,
    stop,
    toggle: () => (recRef.current ? stop() : start()),
  }
}
