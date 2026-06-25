import { useEffect, useState } from 'react'
import { Accessibility, X, Type, Contrast, BookOpen, Eye, Pause } from 'lucide-react'
import { useFocusTrap } from '../lib/useFocusTrap'

type Settings = {
  large: boolean
  contrast: boolean
  readable: boolean
  reduceMotion: boolean
  grey: boolean
}
const DEFAULTS: Settings = { large: false, contrast: false, readable: false, reduceMotion: false, grey: false }
const KEY = 'am.a11y.v1'

function load(): Settings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return DEFAULTS }
}

const OPTIONS: { key: keyof Settings; label: string; desc: string; icon: typeof Type }[] = [
  { key: 'large', label: 'Larger text', desc: 'Increase font size across the site', icon: Type },
  { key: 'contrast', label: 'High contrast', desc: 'Darker text and stronger borders', icon: Contrast },
  { key: 'readable', label: 'Readable font', desc: 'Atkinson Hyperlegible for easier reading', icon: BookOpen },
  { key: 'reduceMotion', label: 'Reduce motion', desc: 'Turn off animations and transitions', icon: Pause },
  { key: 'grey', label: 'Greyscale', desc: 'Remove colour from the interface', icon: Eye },
]

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false)
  const [s, setS] = useState<Settings>(load)
  const trapRef = useFocusTrap<HTMLDivElement>(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('a11y-large', s.large)
    root.classList.toggle('a11y-contrast', s.contrast)
    root.classList.toggle('a11y-readable', s.readable)
    root.classList.toggle('a11y-reduce-motion', s.reduceMotion)
    root.classList.toggle('a11y-grey', s.grey)
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
  }, [s])

  const toggle = (k: keyof Settings) => setS((p) => ({ ...p, [k]: !p[k] }))
  const anyOn = Object.values(s).some(Boolean)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Adjust my experience"
        className="fixed bottom-[72px] left-4 z-[860] flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-white shadow-map transition-transform hover:scale-105 sm:bottom-5 sm:left-5"
      >
        <Accessibility size={18} />
        <span className="hidden sm:inline">Adjust my experience</span>
        {anyOn && <span className="h-2 w-2 rounded-full bg-white" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[870] flex justify-end bg-black/30" onClick={() => setOpen(false)}>
          <div
            ref={trapRef}
            className="h-full w-full max-w-sm animate-[pageIn_280ms_ease-out] overflow-y-auto bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Accessibility settings"
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><Accessibility size={20} className="text-primary" /> Adjust my experience</h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-muted hover:bg-bg hover:text-ink" aria-label="Close"><X size={18} /></button>
            </div>
            <p className="mt-1 text-sm text-muted">Your settings are saved on this device — no account needed.</p>

            <div className="mt-5 space-y-2.5">
              {OPTIONS.map(({ key, label, desc, icon: Icon }) => {
                const on = s[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      on ? 'border-primary bg-primary/5' : 'border-border bg-bg hover:bg-card'
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${on ? 'bg-primary text-white' : 'bg-card text-muted'}`}>
                      <Icon size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium">{label}</span>
                      <span className="block text-xs text-muted">{desc}</span>
                    </span>
                    <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-border'}`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </span>
                  </button>
                )
              })}
            </div>

            {anyOn && (
              <button onClick={() => setS(DEFAULTS)} className="mt-4 w-full text-sm text-muted hover:text-ink">Reset all</button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
