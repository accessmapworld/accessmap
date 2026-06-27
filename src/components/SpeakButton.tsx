import { Volume2, Square } from 'lucide-react'
import { useId } from 'react'
import { useSpeech } from '../lib/useSpeech'

interface Props {
  /** The text to read aloud. */
  text: string
  /** Accessible label for the start action (defaults to "Read aloud"). */
  label?: string
  /** Visual style: a full button or a compact icon-only control. */
  variant?: 'button' | 'icon'
  className?: string
}

/**
 * A self-contained "Read aloud" toggle. Shows a speaker icon; while it's
 * the active utterance it switches to a stop icon. Hidden entirely when
 * the browser has no speech support, so it never leaves a dead control.
 */
export default function SpeakButton({ text, label = 'Read aloud', variant = 'button', className = '' }: Props) {
  const { supported, speaking, activeId, speak, stop } = useSpeech()
  const id = useId()
  const isActive = speaking && activeId === id

  if (!supported) return null

  const toggle = () => (isActive ? stop() : speak(text, id))
  const aria = isActive ? 'Stop reading' : label

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={aria}
        aria-pressed={isActive}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-bg hover:text-primary ${isActive ? 'text-primary' : ''} ${className}`}
      >
        {isActive ? <Square size={15} className="fill-current" aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={aria}
      aria-pressed={isActive}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-card text-ink hover:bg-bg'
      } ${className}`}
    >
      {isActive ? <Square size={14} className="fill-current" aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}
      {isActive ? 'Stop' : label}
    </button>
  )
}
