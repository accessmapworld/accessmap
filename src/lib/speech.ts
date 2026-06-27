/* ------------------------------------------------------------------ *
 * Text-to-speech controller — a thin, framework-agnostic wrapper
 * around the Web Speech API (window.speechSynthesis).
 *
 * Exposes:
 *   - speak(text)        speak a string, cancelling anything in progress
 *   - stopSpeaking()     cancel current speech
 *   - subscribe(cb)      observe { speaking, activeId } changes
 *   - speech "on focus"  reads the accessible name of focused controls,
 *                        for sighted users who benefit from audio support.
 *
 * Everything degrades gracefully when the API is missing (older browsers,
 * SSR) — `speechSupported` is false and all calls are no-ops.
 * ------------------------------------------------------------------ */

export const speechSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

type State = { speaking: boolean; activeId: string | null }
let state: State = { speaking: false, activeId: null }
const listeners = new Set<(s: State) => void>()

function set(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach((fn) => fn(state))
}

export function getSpeechState(): State {
  return state
}

export function subscribeSpeech(fn: (s: State) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Speak `text`. `id` lets a UI control know whether *it* is the active speaker. */
export function speak(text: string, id: string | null = null) {
  if (!speechSupported || !text.trim()) return
  const synth = window.speechSynthesis
  synth.cancel() // stop anything already queued/playing
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1
  u.pitch = 1
  u.lang = document.documentElement.lang || 'en-US'
  u.onend = () => set({ speaking: false, activeId: null })
  u.onerror = () => set({ speaking: false, activeId: null })
  set({ speaking: true, activeId: id })
  // Some browsers (Chrome) need a tick after cancel() before speaking.
  setTimeout(() => synth.speak(u), 0)
}

export function stopSpeaking() {
  if (!speechSupported) return
  window.speechSynthesis.cancel()
  set({ speaking: false, activeId: null })
}

/* ----------------------- Speak-on-focus mode ----------------------- *
 * When enabled, moving keyboard/AT focus or hovering over an interactive
 * element reads its accessible label aloud. Opt-in only.
 * ------------------------------------------------------------------ */

const SPEAK_FOCUS_KEY = 'am.speakFocus'
let focusModeOn = false
let lastSpoken = ''

function accessibleName(el: Element | null): string {
  if (!el || !(el instanceof HTMLElement)) return ''
  const aria = el.getAttribute('aria-label')
  if (aria) return aria
  const labelledby = el.getAttribute('aria-labelledby')
  if (labelledby) {
    const text = labelledby
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ')
    if (text) return text
  }
  if (el instanceof HTMLImageElement && el.alt) return el.alt
  const text = el.textContent?.trim() ?? ''
  return text.length > 240 ? text.slice(0, 240) + '…' : text
}

function shouldSpeak(el: Element | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false
  return Boolean(el.closest('a, button, [role="button"], [role="option"], h1, h2, h3, summary, label'))
}

function onFocusIn(e: FocusEvent) {
  const target = (e.target as HTMLElement)?.closest(
    'a, button, [role="button"], [role="option"], h1, h2, h3, summary, label',
  )
  if (!shouldSpeak(target)) return
  const name = accessibleName(target)
  if (name && name !== lastSpoken) {
    lastSpoken = name
    speak(name)
  }
}

export function setSpeakOnFocus(on: boolean) {
  if (!speechSupported) return
  focusModeOn = on
  try { localStorage.setItem(SPEAK_FOCUS_KEY, on ? '1' : '0') } catch { /* ignore */ }
  window.removeEventListener('focusin', onFocusIn)
  if (on) {
    window.addEventListener('focusin', onFocusIn)
  } else {
    stopSpeaking()
    lastSpoken = ''
  }
}

export function isSpeakOnFocus(): boolean {
  return focusModeOn
}

/** Restore the saved speak-on-focus preference on app start. */
export function initSpeech() {
  if (!speechSupported) return
  try {
    if (localStorage.getItem(SPEAK_FOCUS_KEY) === '1') setSpeakOnFocus(true)
  } catch { /* ignore */ }
}
