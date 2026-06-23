import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import PhotoUpload from './PhotoUpload'
import { addAlert, getPlaces } from '../lib/data'
import { useStore } from '../store/useStore'
import type { Place, AlertType } from '../types'

const TYPES: { value: AlertType; label: string }[] = [
  { value: 'elevator', label: 'Broken elevator' },
  { value: 'ramp', label: 'Blocked ramp' },
  { value: 'bathroom', label: 'Inaccessible bathroom' },
  { value: 'noise', label: 'Noise level change' },
  { value: 'obstruction', label: 'Temporary obstruction' },
  { value: 'other', label: 'Other' },
]

export default function ReportForm({ placeId, onDone }: { placeId?: string; onDone?: () => void }) {
  const user = useStore((s) => s.user)
  const [places, setPlaces] = useState<Place[]>([])
  const [selected, setSelected] = useState(placeId ?? '')
  const [type, setType] = useState<AlertType>('elevator')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<{ url: string; verified: boolean; confidence: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => { if (!placeId) getPlaces().then(setPlaces) }, [placeId])
  const valid = selected && description.trim().length >= 8

  async function submit() {
    if (!valid) return
    setBusy(true)
    await addAlert({
      placeId: selected,
      type,
      description: description.trim(),
      reportedBy: user?.displayName ?? 'Anonymous',
      photoUrl: photo?.url,
      aiVerified: photo?.verified ?? false,
      aiConfidence: photo?.confidence,
    })
    setBusy(false)
    setDone(true)
    setTimeout(() => onDone?.(), 900)
  }

  if (done) return <p className="py-6 text-center text-alert">Report submitted — it’s now live on the place ⚠</p>

  return (
    <div className="space-y-4">
      {!placeId && (
        <label className="block">
          <span className="label">Place</span>
          <select className="input mt-1" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Select a place…</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}

      <label className="block">
        <span className="label">Issue type</span>
        <select className="input mt-1" value={type} onChange={(e) => setType(e.target.value as AlertType)}>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="label">Description</span>
        <textarea
          className="input mt-1 min-h-24" value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue and any workaround…"
        />
      </label>

      <div>
        <span className="label">Photo (verified by AI)</span>
        <div className="mt-1">
          <PhotoUpload onResult={({ url, verify }) => setPhoto({ url, verified: verify.verified, confidence: verify.confidence })} />
        </div>
      </div>

      <button disabled={!valid || busy} onClick={submit} className="btn-alert w-full disabled:opacity-50">
        {busy ? <Loader2 className="animate-spin" size={16} /> : null} Submit report
      </button>
    </div>
  )
}
