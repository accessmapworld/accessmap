import { useEffect, useState } from 'react'
import {
  speechSupported, speak, stopSpeaking, subscribeSpeech, getSpeechState,
} from './speech'

/**
 * React binding for the speech controller. Components get reactive
 * `speaking`/`activeId` plus stable speak/stop helpers.
 */
export function useSpeech() {
  const [state, setState] = useState(getSpeechState)

  useEffect(() => subscribeSpeech(setState), [])

  return {
    supported: speechSupported,
    speaking: state.speaking,
    activeId: state.activeId,
    speak,
    stop: stopSpeaking,
  }
}
