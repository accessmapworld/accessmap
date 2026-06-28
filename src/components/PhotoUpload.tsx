import { useRef, useState } from 'react'
import { UploadCloud, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { verifyAccessibilityPhoto } from '../lib/roboflow'
import { FIREBASE_ENABLED, getStorageInstance } from '../lib/firebase'
import type { VerifyResult } from '../types'

interface Props {
  onResult?: (r: { url: string; verify: VerifyResult }) => void
}

export default function PhotoUpload({ onResult }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [verify, setVerify] = useState<VerifyResult | null>(null)

  async function handle(file: File) {
    setBusy(true)
    setVerify(null)
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    try {
      let url = localUrl
      const storage = FIREBASE_ENABLED ? await getStorageInstance() : null
      if (storage) {
        const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')
        const r = storageRef(storage, `uploads/${Date.now()}-${file.name}`)
        await uploadBytes(r, file)
        url = await getDownloadURL(r)
      }
      const result = await verifyAccessibilityPhoto(url)
      setVerify(result)
      onResult?.({ url, verify: result })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a photo — drag and drop, or activate to browse"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() }
        }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false)
          const f = e.dataTransfer.files?.[0]
          if (f) handle(f)
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors duration-150 ${
          drag ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="upload preview" className="max-h-40 rounded-lg object-cover" />
            {verify && (
              <span
                className={`absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  verify.verified ? 'bg-green-600 text-white' : 'bg-alert text-white'
                }`}
              >
                {verify.verified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                {verify.verified ? 'Verified by AI' : 'Unverified'} · {(verify.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        ) : (
          <>
            <UploadCloud className="text-muted" size={28} />
            <p className="text-sm text-muted">Drag & drop a photo, or click to browse</p>
          </>
        )}
        {busy && (
          <p className="flex items-center gap-2 text-sm text-primary" role="status" aria-live="polite">
            <Loader2 className="animate-spin" size={16} /> Verifying with AI…
          </p>
        )}
      </div>
      {verify?.detectedFeatures.length ? (
        <p className="label mt-2">detected: {verify.detectedFeatures.join(', ').replace(/_/g, ' ')}</p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f) }}
      />
    </div>
  )
}
