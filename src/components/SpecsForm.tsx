import { useState } from 'react'
import { Check, Loader2, Camera } from 'lucide-react'
import type { AccessSpecs } from '../types'
import { addSpecs } from '../lib/data'
import { useStore } from '../store/useStore'
import PhotoUpload from './PhotoUpload'

interface Props { placeId: string; onDone?: () => void }

type Section = 'entrance' | 'interior' | 'surface' | 'parking'

export default function SpecsForm({ placeId, onDone }: Props) {
  const user = useStore((s) => s.user)
  const [section, setSection] = useState<Section>('entrance')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [draft, setDraft] = useState<Omit<AccessSpecs, 'id' | 'placeId' | 'contributedBy' | 'contributedAt'>>({})

  function set<K extends keyof typeof draft>(k: K, v: typeof draft[K]) {
    setDraft(d => ({ ...d, [k]: v }))
  }

  async function submit() {
    setBusy(true)
    try {
      await addSpecs({
        placeId,
        contributedBy: user?.displayName ?? 'Anonymous',
        ...draft,
        photos,
        notes: draft.notes?.trim() || undefined,
      })
      setDone(true)
      setTimeout(() => onDone?.(), 800)
    } catch { /* */ } finally { setBusy(false) }
  }

  if (done) return <p className="py-6 text-center text-primary font-medium">Thanks — your info is live ✓</p>

  const SECTIONS: { key: Section; label: string }[] = [
    { key: 'entrance', label: 'Entrance' },
    { key: 'interior', label: 'Inside' },
    { key: 'surface', label: 'Surfaces' },
    { key: 'parking', label: 'Parking' },
  ]

  return (
    <div className="space-y-5">
      {/* Section tabs */}
      <div className="flex gap-1 rounded-xl bg-bg p-1">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${section === s.key ? 'bg-card shadow-sm text-ink' : 'text-muted hover:text-ink'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {section === 'entrance' && (
        <div className="space-y-4">
          <BoolField label="Step-free entrance?" value={draft.hasStepFreeEntrance} onChange={v => set('hasStepFreeEntrance', v)} />
          {draft.hasStepFreeEntrance === false && (
            <NumberField label="Number of steps at entrance" value={draft.entranceStepCount} onChange={v => set('entranceStepCount', v)} min={1} max={30} />
          )}
          <BoolField label="Ramp present?" value={draft.rampPresent} onChange={v => set('rampPresent', v)} />
          {draft.rampPresent && (
            <>
              <SelectField label="Ramp gradient" value={draft.rampGradient} onChange={v => set('rampGradient', v as any)}
                options={[['gentle', 'Gentle (easy to use)'], ['moderate', 'Moderate'], ['steep', 'Steep (difficult)']]} />
              <BoolField label="Ramp has handrails?" value={draft.rampHasHandrails} onChange={v => set('rampHasHandrails', v)} />
            </>
          )}
          <NumberField label="Main door width (cm)" value={draft.doorWidthCm} onChange={v => set('doorWidthCm', v)} min={50} max={200} placeholder="e.g. 90" />
          <SelectField label="Door type" value={draft.doorType} onChange={v => set('doorType', v as any)}
            options={[['automatic', 'Automatic / powered'], ['manual', 'Manual (light)'], ['heavy_manual', 'Manual (heavy)'], ['revolving', 'Revolving door']]} />
        </div>
      )}

      {section === 'interior' && (
        <div className="space-y-4">
          <BoolField label="Lift / elevator inside?" value={draft.hasLift} onChange={v => set('hasLift', v)} />
          {draft.hasLift && (
            <NumberField label="Lift door width (cm)" value={draft.liftDoorWidthCm} onChange={v => set('liftDoorWidthCm', v)} min={60} max={200} placeholder="e.g. 90" />
          )}
          <NumberField label="Narrowest corridor width (cm)" value={draft.corridorWidthCm} onChange={v => set('corridorWidthCm', v)} min={50} max={300} placeholder="e.g. 120" />
          <BoolField label="Accessible toilet?" value={draft.hasAccessibleToilet} onChange={v => set('hasAccessibleToilet', v)} />
          {draft.hasAccessibleToilet && (
            <>
              <BoolField label="Grab rails in toilet?" value={draft.toiletGrabRails} onChange={v => set('toiletGrabRails', v)} />
              <NumberField label="Turning space in toilet (cm)" value={draft.turningSpaceCm} onChange={v => set('turningSpaceCm', v)} min={100} max={200} placeholder="e.g. 150" />
            </>
          )}
        </div>
      )}

      {section === 'surface' && (
        <div className="space-y-4">
          <SelectField label="Main floor surface" value={draft.floorSurface} onChange={v => set('floorSurface', v as any)}
            options={[['smooth', 'Smooth / tiles / hardwood'], ['carpet', 'Carpet'], ['uneven', 'Uneven / bumpy'], ['cobblestone', 'Cobblestone'], ['gravel', 'Gravel / loose surface']]} />
          <BoolField label="Tactile paving outside?" value={draft.hasTactilePaving} onChange={v => set('hasTactilePaving', v)} />
        </div>
      )}

      {section === 'parking' && (
        <div className="space-y-4">
          <BoolField label="Disabled parking bays?" value={draft.hasDisabledParking} onChange={v => set('hasDisabledParking', v)} />
          {draft.hasDisabledParking && (
            <NumberField label="Distance from parking to entrance (m)" value={draft.parkingDistanceM} onChange={v => set('parkingDistanceM', v)} min={0} max={500} placeholder="e.g. 30" />
          )}
        </div>
      )}

      {/* Notes + photos */}
      <div>
        <label className="label block mb-1">Additional notes (optional)</label>
        <textarea
          value={draft.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Anything else useful — e.g. 'ramp is on the side street entrance'"
          rows={3}
          className="input resize-none"
        />
      </div>

      <div>
        <p className="label mb-2 flex items-center gap-1.5"><Camera size={14} /> Add photos (optional but very helpful)</p>
        <PhotoUpload onResult={r => setPhotos(p => [...p, r.url])} />
        {photos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {photos.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
                <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-alert text-white text-xs">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={submit} disabled={busy} className="btn-primary w-full">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        {busy ? 'Saving…' : 'Submit specs'}
      </button>
      <p className="text-center text-xs text-muted">Your contribution is visible immediately and helps everyone plan ahead.</p>
    </div>
  )
}

function BoolField({ label, value, onChange }: { label: string; value?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <p className="label mb-2">{label}</p>
      <div className="flex gap-2">
        {([true, false] as const).map(v => (
          <button key={String(v)} onClick={() => onChange(v)}
            className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${value === v ? 'border-primary bg-primary/8 text-primary' : 'border-border hover:bg-bg'}`}>
            {v ? '✓ Yes' : '✗ No'}
          </button>
        ))}
      </div>
    </div>
  )
}

function NumberField({ label, value, onChange, min, max, placeholder }: {
  label: string; value?: number; onChange: (v: number) => void; min: number; max: number; placeholder?: string
}) {
  return (
    <div>
      <label className="label mb-1 block">{label}</label>
      <input type="number" value={value ?? ''} onChange={e => { const n = parseInt(e.target.value); if (!isNaN(n) && n >= min && n <= max) onChange(n) }}
        placeholder={placeholder} min={min} max={max} className="input" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: {
  label: string; value?: string; onChange: (v: string) => void; options: [string, string][]
}) {
  return (
    <div>
      <p className="label mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map(([v, l]) => (
          <button key={v} onClick={() => onChange(v)}
            className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${value === v ? 'border-primary bg-primary/8 text-primary' : 'border-border hover:bg-bg'}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}
