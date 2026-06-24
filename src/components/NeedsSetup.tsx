import { useState } from 'react'
import { X, ChevronRight, Check, User2 } from 'lucide-react'
import type { NeedsProfile } from '../types'
import { DEFAULT_PROFILE, hasProfile } from '../lib/compatibility'
import { useStore } from '../store/useStore'

interface Props {
  onClose: () => void
}

type Step = 'mobility' | 'hearing' | 'vision' | 'sensory' | 'features' | 'done'

const STEPS: Step[] = ['mobility', 'hearing', 'vision', 'sensory', 'features', 'done']

const MOBILITY_OPTIONS = [
  { value: 'none', label: 'No mobility aid', emoji: '🚶' },
  { value: 'cane', label: 'Walking cane or crutches', emoji: '🦯' },
  { value: 'manual_wheelchair', label: 'Manual wheelchair', emoji: '♿' },
  { value: 'power_wheelchair', label: 'Power wheelchair', emoji: '⚡' },
  { value: 'scooter', label: 'Mobility scooter', emoji: '🛵' },
] as const

const HEARING_OPTIONS = [
  { value: 'none', label: 'Full hearing', emoji: '👂' },
  { value: 'hard_of_hearing', label: 'Hard of hearing', emoji: '🔉' },
  { value: 'deaf', label: 'Deaf / use sign language', emoji: '🤟' },
] as const

const VISION_OPTIONS = [
  { value: 'none', label: 'Full vision', emoji: '👁️' },
  { value: 'low_vision', label: 'Low vision / partially sighted', emoji: '🔍' },
  { value: 'blind', label: 'Blind / no usable vision', emoji: '🦮' },
] as const

const SENSORY_OPTIONS = [
  { value: 'none', label: 'No sensory sensitivities', emoji: '😊' },
  { value: 'sensitive', label: 'Some sensory sensitivities', emoji: '🌿' },
  { value: 'severe', label: 'Significant sensory needs (e.g. autism)', emoji: '🔇' },
] as const

export default function NeedsSetup({ onClose }: Props) {
  const setNeedsProfile = useStore((s) => s.setNeedsProfile)
  const existing = useStore((s) => s.needsProfile)
  const [draft, setDraft] = useState<NeedsProfile>({ ...existing })
  const [stepIdx, setStepIdx] = useState(0)
  const step = STEPS[stepIdx]

  function next() { setStepIdx((i) => Math.min(i + 1, STEPS.length - 1)) }
  function back() { setStepIdx((i) => Math.max(i - 1, 0)) }
  function save() { setNeedsProfile(draft); onClose() }
  function reset() { setDraft({ ...DEFAULT_PROFILE }) }

  const progress = Math.round((stepIdx / (STEPS.length - 1)) * 100)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="needs-setup-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="card w-full max-w-md animate-page-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <User2 size={20} className="text-primary" />
            <h2 id="needs-setup-title" className="font-semibold">Your accessibility needs</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-bg hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-border" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Setup progress">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-6">
          {step === 'mobility' && (
            <StepBlock
              title="How do you get around?"
              subtitle="We'll weight mobility scores and terrain ratings for you."
              options={MOBILITY_OPTIONS}
              value={draft.mobility}
              onChange={(v) => setDraft((d) => ({ ...d, mobility: v as NeedsProfile['mobility'] }))}
            />
          )}
          {step === 'hearing' && (
            <StepBlock
              title="How is your hearing?"
              subtitle="We'll flag hearing loop availability and quiet spaces."
              options={HEARING_OPTIONS}
              value={draft.hearing}
              onChange={(v) => setDraft((d) => ({ ...d, hearing: v as NeedsProfile['hearing'] }))}
            />
          )}
          {step === 'vision' && (
            <StepBlock
              title="How is your vision?"
              subtitle="We'll flag tactile paving, Braille signage, and visual accessibility scores."
              options={VISION_OPTIONS}
              value={draft.vision}
              onChange={(v) => setDraft((d) => ({ ...d, vision: v as NeedsProfile['vision'] }))}
            />
          )}
          {step === 'sensory' && (
            <StepBlock
              title="Do you have sensory sensitivities?"
              subtitle="We'll flag noisy, busy, or overwhelming environments."
              options={SENSORY_OPTIONS}
              value={draft.sensory}
              onChange={(v) => setDraft((d) => ({ ...d, sensory: v as NeedsProfile['sensory'] }))}
            />
          )}
          {step === 'features' && (
            <div>
              <p className="font-semibold text-ink">Any specific features you always need?</p>
              <p className="mt-1 text-sm text-muted">We'll warn you when a place doesn't have these.</p>
              <div className="mt-4 space-y-3">
                {([
                  ['needsLift', 'Elevator or lift'],
                  ['needsAccessibleToilet', 'Accessible / wheelchair toilet'],
                  ['needsHearingLoop', 'Hearing loop / induction loop'],
                  ['needsTactile', 'Tactile paving or Braille signage'],
                  ['needsQuietSpace', 'Quiet or low-stimulation space'],
                ] as [keyof NeedsProfile, string][]).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 hover:bg-bg">
                    <input
                      type="checkbox"
                      checked={!!draft[key]}
                      onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.checked }))}
                      className="h-5 w-5 rounded border-border accent-primary"
                      aria-label={label}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {step === 'done' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Check size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Profile saved!</h3>
              <p className="mt-2 text-muted">
                Every place on the map will now show a personal match score based on your needs. Look for the
                <span className="mx-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">For You</span>
                badge.
              </p>
              {hasProfile(existing) && (
                <button onClick={reset} className="mt-4 text-sm text-muted underline hover:text-ink">
                  Reset to no preferences
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            onClick={stepIdx === 0 ? onClose : back}
            className="btn-ghost text-sm"
            aria-label={stepIdx === 0 ? 'Cancel' : 'Back'}
          >
            {stepIdx === 0 ? 'Cancel' : '← Back'}
          </button>
          {step !== 'done' ? (
            <button onClick={next} className="btn-primary text-sm">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={save} className="btn-primary text-sm">
              <Check size={16} /> Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StepBlock<T extends string>({
  title, subtitle, options, value, onChange,
}: {
  title: string
  subtitle: string
  options: readonly { value: T; label: string; emoji: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="font-semibold text-ink">{title}</legend>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      <div className="mt-4 space-y-2" role="radiogroup" aria-label={title}>
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
              value === o.value ? 'border-primary bg-primary/8 font-medium text-primary' : 'border-border hover:bg-bg'
            }`}
          >
            <input
              type="radio"
              name={title}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span className="text-xl" aria-hidden="true">{o.emoji}</span>
            <span className="text-sm">{o.label}</span>
            {value === o.value && <Check size={16} className="ml-auto text-primary" aria-hidden="true" />}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
