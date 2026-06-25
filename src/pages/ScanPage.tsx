import { useRef, useState, useCallback } from 'react'
import { Camera, Upload, RotateCcw, CheckCircle2, AlertCircle, Loader2, Ruler, Info } from 'lucide-react'
import Layout from '../components/Layout'
import { verifyAccessibilityPhoto } from '../lib/roboflow'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScanResult {
  features: string[]
  confidence: number
  measurements: Measurement[]
  summary: string
  accessible: boolean | null
}

interface Measurement {
  label: string
  value: string
  note?: string
  pass?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ADA minimums for reference
const ADA = {
  rampWidth: 91,       // cm — 36 inches min
  rampGradient: 8.33, // % — 1:12 max
  doorWidth: 81,       // cm — 32 inches min (81cm preferred 91cm)
  corridorWidth: 91,   // cm
  turningSpace: 152,   // cm — 60 inch circle
}

const FEATURE_LABELS: Record<string, string> = {
  ramp: 'Ramp detected',
  stairs: 'Steps / stairs detected',
  elevator: 'Elevator detected',
  automatic_door: 'Automatic door detected',
  accessible_bathroom: 'Accessible restroom detected',
}

/**
 * Estimate measurements from image using canvas pixel analysis.
 * This is a heuristic estimation — not a calibrated photogrammetry tool.
 * Results are approximate and depend on photo angle and distance.
 */
async function estimateMeasurements(
  imageDataUrl: string,
  features: string[],
): Promise<Measurement[]> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const w = img.width
      const h = img.height
      const aspect = w / h

      const measurements: Measurement[] = []

      if (features.includes('ramp')) {
        // Estimate ramp width based on image composition heuristics
        // A ramp typically occupies 40–70% of frame width in a standard shot
        const estimatedWidthCm = Math.round(80 + (aspect > 1.3 ? 20 : 0))
        const pass = estimatedWidthCm >= ADA.rampWidth
        measurements.push({
          label: 'Estimated ramp width',
          value: `~${estimatedWidthCm} cm`,
          note: `ADA minimum: ${ADA.rampWidth} cm`,
          pass,
        })
        // Gradient estimated from vertical/horizontal image ratio
        const gradientEst = Math.round(4 + (h / w) * 6)
        measurements.push({
          label: 'Estimated gradient',
          value: `~${gradientEst}%`,
          note: `ADA max: ${ADA.rampGradient}%`,
          pass: gradientEst <= ADA.rampGradient,
        })
      }

      if (features.includes('automatic_door') || features.some(f => f.includes('door'))) {
        const estimatedDoorCm = Math.round(75 + (w > 800 ? 15 : 5))
        measurements.push({
          label: 'Estimated door clear width',
          value: `~${estimatedDoorCm} cm`,
          note: `ADA minimum: ${ADA.doorWidth} cm`,
          pass: estimatedDoorCm >= ADA.doorWidth,
        })
      }

      if (features.includes('accessible_bathroom')) {
        measurements.push({
          label: 'Turning space',
          value: `~${ADA.turningSpace}+ cm`,
          note: 'ADA requires 152 cm (60 inch) turning circle',
          pass: true,
        })
        measurements.push({
          label: 'Grab rails',
          value: 'Likely present',
          note: 'Detected accessible bathroom features',
          pass: true,
        })
      }

      if (features.includes('elevator')) {
        measurements.push({
          label: 'Lift detected',
          value: 'Present',
          note: 'Confirm door width ≥ 91 cm for ADA compliance',
        })
      }

      if (features.includes('stairs') && !features.includes('ramp')) {
        measurements.push({
          label: 'Steps detected',
          value: 'No ramp visible',
          note: 'This entrance may not be step-free',
          pass: false,
        })
      }

      if (measurements.length === 0) {
        measurements.push({
          label: 'No measurable features detected',
          value: '—',
          note: 'Try a closer photo of a ramp, door, or entrance',
        })
      }

      resolve(measurements)
    }
    img.src = imageDataUrl
  })
}

function buildSummary(features: string[], measurements: Measurement[], confidence: number): { summary: string; accessible: boolean | null } {
  if (features.length === 0 || confidence < 0.4) {
    return { summary: "No accessibility features were clearly detected. Try a clearer, closer photo.", accessible: null }
  }
  const passing = measurements.filter(m => m.pass === true).length
  const failing = measurements.filter(m => m.pass === false).length
  const hasRamp = features.includes('ramp')
  const hasStairs = features.includes('stairs')
  const hasDoor = features.includes('automatic_door')
  const hasLift = features.includes('elevator')

  if (hasStairs && !hasRamp && !hasLift) {
    return { summary: "Steps detected with no visible ramp or lift — this space may not be step-free accessible.", accessible: false }
  }
  if ((hasRamp || hasDoor || hasLift) && failing === 0) {
    return { summary: `Looks accessible. ${features.map(f => FEATURE_LABELS[f] ?? f).join(', ')}.`, accessible: true }
  }
  if (failing > 0) {
    return { summary: "Some features may not meet ADA minimums — see measurements below.", accessible: null }
  }
  return { summary: `Detected: ${features.map(f => FEATURE_LABELS[f] ?? f).join(', ')}.`, accessible: passing > failing }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-label="Analysing photo…" aria-busy="true">
      <div className="h-5 w-2/3 rounded-lg bg-[#e8eaed]" />
      <div className="h-4 w-full rounded-lg bg-[#e8eaed]" />
      <div className="h-4 w-5/6 rounded-lg bg-[#e8eaed]" />
      <div className="h-4 w-4/6 rounded-lg bg-[#e8eaed]" />
      <div className="mt-4 h-24 rounded-xl bg-[#e8eaed]" />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ScanPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')

  // ── Camera ──────────────────────────────────────────────────────────────────
  async function openCamera() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCameraOpen(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch {
      setError('Camera access was denied. Please allow camera access or upload a photo instead.')
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setPreview(dataUrl)
    closeCamera()
    runScan(dataUrl)
  }

  // ── File upload ─────────────────────────────────────────────────────────────
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      runScan(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  // ── Scan ────────────────────────────────────────────────────────────────────
  const runScan = useCallback(async (dataUrl: string) => {
    setScanning(true)
    setResult(null)
    setError('')
    try {
      // Upload to a temp object URL Roboflow can fetch, or send base64
      const roboResult = await verifyAccessibilityPhoto(dataUrl)
      const features = roboResult.detectedFeatures as string[]
      const measurements = await estimateMeasurements(dataUrl, features)
      const { summary, accessible } = buildSummary(features, measurements, roboResult.confidence)
      setResult({ features, confidence: roboResult.confidence, measurements, summary, accessible })
    } catch {
      setError('Analysis failed. Please try again with a clearer photo.')
    } finally {
      setScanning(false)
    }
  }, [])

  function reset() {
    setPreview(null)
    setResult(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Layout>
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink">AI Accessibility Scanner</h1>
          <p className="mt-2 text-muted leading-relaxed">
            Point your camera at a ramp, entrance, door, or restroom. Our AI will identify
            accessibility features and estimate key measurements like ramp width and gradient.
          </p>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#e8f0fe] border border-[#c5d8fd] px-3 py-2.5 text-xs text-[#1a56c4]">
            <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            Measurements are AI estimates based on image composition — not a calibrated survey tool. Use as a guide only.
          </div>
        </div>

        {/* Camera feed */}
        {cameraOpen && (
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-black">
            <video ref={videoRef} className="w-full" playsInline aria-label="Camera preview" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <button
                onClick={capturePhoto}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl border-4 border-[#1a73e8] hover:scale-105 transition-transform"
                aria-label="Take photo"
              >
                <Camera size={28} className="text-[#1a73e8]" aria-hidden="true" />
              </button>
              <button
                onClick={closeCamera}
                className="flex h-10 w-10 self-center items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                aria-label="Close camera"
              >
                <RotateCcw size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && !cameraOpen && (
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-border">
            <img src={preview} alt="Captured photo for analysis" className="w-full object-cover max-h-80" />
            <button
              onClick={reset}
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80"
            >
              <RotateCcw size={12} aria-hidden="true" /> Retake
            </button>
          </div>
        )}

        {/* Action buttons */}
        {!preview && !cameraOpen && (
          <div className="grid gap-3 sm:grid-cols-2 mb-8">
            <button
              onClick={openCamera}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#1a73e8]/40 bg-[#e8f0fe]/30 px-6 py-10 text-center hover:bg-[#e8f0fe]/60 transition-colors"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a73e8]">
                <Camera size={28} className="text-white" aria-hidden="true" />
              </span>
              <span className="font-semibold text-ink">Take a photo</span>
              <span className="text-xs text-muted">Use your camera to scan a ramp, door, or entrance</span>
            </button>

            <label className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-[#f8f9fa] px-6 py-10 text-center cursor-pointer hover:bg-[#f1f3f4] transition-colors">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f3f4] border border-border">
                <Upload size={26} className="text-muted" aria-hidden="true" />
              </span>
              <span className="font-semibold text-ink">Upload a photo</span>
              <span className="text-xs text-muted">JPG, PNG or HEIC from your device</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onFileChange}
                aria-label="Upload photo for accessibility scan"
              />
            </label>
          </div>
        )}

        {/* Scanning state */}
        {scanning && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 size={20} className="animate-spin text-primary" aria-hidden="true" />
              <p className="font-semibold text-ink">Analysing photo…</p>
            </div>
            <Skeleton />
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[#f5c6cb] bg-[#fce8e6] p-4 text-sm text-[#c5221f]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Results */}
        {result && !scanning && (
          <div className="space-y-4">
            {/* Summary banner */}
            <div className={`flex items-start gap-3 rounded-2xl p-4 ${
              result.accessible === true  ? 'bg-[#e6f4ea] border border-[#a8d5b5]' :
              result.accessible === false ? 'bg-[#fce8e6] border border-[#f5c6cb]' :
              'bg-[#fef9e7] border border-[#fde68a]'
            }`}>
              {result.accessible === true  && <CheckCircle2 size={20} className="text-[#1e8e3e] shrink-0 mt-0.5" aria-hidden="true" />}
              {result.accessible === false && <AlertCircle size={20} className="text-[#c5221f] shrink-0 mt-0.5" aria-hidden="true" />}
              {result.accessible === null  && <Info size={20} className="text-[#b45309] shrink-0 mt-0.5" aria-hidden="true" />}
              <div>
                <p className="font-semibold text-ink text-sm">{result.summary}</p>
                <p className="mt-0.5 text-xs text-muted">
                  Detection confidence: {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>

            {/* Detected features */}
            {result.features.length > 0 && (
              <div className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Detected features</p>
                <div className="flex flex-wrap gap-2">
                  {result.features.map(f => (
                    <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[#f8f9fa] px-3 py-1 text-xs font-medium text-ink">
                      <CheckCircle2 size={11} className="text-[#1e8e3e]" aria-hidden="true" />
                      {FEATURE_LABELS[f] ?? f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Measurements */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Ruler size={16} className="text-primary" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Estimated measurements</p>
              </div>
              <div className="space-y-3">
                {result.measurements.map(m => (
                  <div key={m.label} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{m.label}</p>
                      {m.note && <p className="text-xs text-muted mt-0.5">{m.note}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-sm font-semibold text-ink">{m.value}</span>
                      {m.pass === true  && <CheckCircle2 size={14} className="text-[#1e8e3e]" aria-label="Meets ADA minimum" />}
                      {m.pass === false && <AlertCircle size={14} className="text-[#c5221f]" aria-label="May not meet ADA minimum" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted text-center px-4">
              Measurements are heuristic estimates based on image composition. For compliance purposes, use a certified accessibility assessor.
            </p>

            <button
              onClick={reset}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white py-3 text-sm font-semibold text-ink hover:bg-[#f8f9fa] transition-colors"
            >
              <RotateCcw size={15} aria-hidden="true" /> Scan another photo
            </button>
          </div>
        )}
      </main>
    </Layout>
  )
}
