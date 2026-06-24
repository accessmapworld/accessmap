import type { AccessSpecs } from '../types'
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react'

interface Props { specs: AccessSpecs[] }

function timeAgo(ms: number) {
  const d = Math.floor((Date.now() - ms) / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  return new Date(ms).toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

const YN = ({ v }: { v?: boolean }) =>
  v === true  ? <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 size={13} /> Yes</span>
  : v === false ? <span className="inline-flex items-center gap-1 text-red-600"><XCircle size={13} /> No</span>
  : <span className="inline-flex items-center gap-1 text-muted"><MinusCircle size={13} /> Unknown</span>

const RAMP_GRADIENT: Record<string, string> = { gentle: 'Gentle', moderate: 'Moderate', steep: 'Steep ⚠️' }
const DOOR_TYPE: Record<string, string> = { automatic: 'Automatic', manual: 'Manual (light)', heavy_manual: 'Manual (heavy) ⚠️', revolving: 'Revolving ⚠️' }
const SURFACE: Record<string, string> = { smooth: 'Smooth / tiles', carpet: 'Carpet', uneven: 'Uneven', cobblestone: 'Cobblestone ⚠️', gravel: 'Gravel ⚠️' }

export default function SpecsPanel({ specs }: Props) {
  if (specs.length === 0) return (
    <p className="py-4 text-sm text-muted">No physical specs yet — be the first to add details!</p>
  )

  // Merge: take the most recent answer for each field
  const merged: Partial<AccessSpecs> = {}
  for (const s of [...specs].reverse()) Object.assign(merged, s)

  const photos = specs.flatMap(s => s.photos ?? [])

  return (
    <div className="space-y-5">
      {/* Photo gallery */}
      {photos.length > 0 && (
        <div>
          <p className="label mb-2">Community photos</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((url, i) => (
              <img key={i} src={url} alt={`Accessibility photo ${i + 1}`}
                className="h-28 w-28 shrink-0 rounded-xl object-cover border border-border" />
            ))}
          </div>
        </div>
      )}

      {/* Entrance */}
      <Section title="🚪 Entrance">
        <Row label="Step-free entrance"><YN v={merged.hasStepFreeEntrance} /></Row>
        {merged.entranceStepCount != null && <Row label="Steps at entrance"><span>{merged.entranceStepCount}</span></Row>}
        <Row label="Ramp"><YN v={merged.rampPresent} /></Row>
        {merged.rampGradient && <Row label="Ramp gradient"><span>{RAMP_GRADIENT[merged.rampGradient]}</span></Row>}
        {merged.rampHasHandrails != null && <Row label="Ramp handrails"><YN v={merged.rampHasHandrails} /></Row>}
        {merged.doorWidthCm && <Row label="Door width"><span>{merged.doorWidthCm} cm</span></Row>}
        {merged.doorType && <Row label="Door type"><span>{DOOR_TYPE[merged.doorType]}</span></Row>}
      </Section>

      {/* Interior */}
      <Section title="🏢 Inside">
        <Row label="Lift / elevator"><YN v={merged.hasLift} /></Row>
        {merged.liftDoorWidthCm && <Row label="Lift door width"><span>{merged.liftDoorWidthCm} cm</span></Row>}
        {merged.corridorWidthCm && <Row label="Narrowest corridor"><span>{merged.corridorWidthCm} cm</span></Row>}
        <Row label="Accessible toilet"><YN v={merged.hasAccessibleToilet} /></Row>
        {merged.hasAccessibleToilet && <Row label="Toilet grab rails"><YN v={merged.toiletGrabRails} /></Row>}
        {merged.turningSpaceCm && <Row label="Toilet turning space"><span>{merged.turningSpaceCm} cm</span></Row>}
      </Section>

      {/* Surfaces */}
      {(merged.floorSurface || merged.hasTactilePaving != null) && (
        <Section title="🛣️ Surfaces">
          {merged.floorSurface && <Row label="Floor surface"><span>{SURFACE[merged.floorSurface]}</span></Row>}
          {merged.hasTactilePaving != null && <Row label="Tactile paving"><YN v={merged.hasTactilePaving} /></Row>}
        </Section>
      )}

      {/* Parking */}
      {(merged.hasDisabledParking != null || merged.parkingDistanceM != null) && (
        <Section title="🅿️ Parking">
          <Row label="Disabled parking bays"><YN v={merged.hasDisabledParking} /></Row>
          {merged.parkingDistanceM != null && <Row label="Distance to entrance"><span>{merged.parkingDistanceM} m</span></Row>}
        </Section>
      )}

      {merged.notes && (
        <div className="rounded-xl bg-bg p-3 text-sm text-muted italic">"{merged.notes}"</div>
      )}

      <p className="text-xs text-muted">
        {specs.length} contribution{specs.length !== 1 ? 's' : ''} · last updated {timeAgo(specs[0].contributedAt)} by {specs[0].contributedBy}
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted">{title}</p>
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}
