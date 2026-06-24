import type { AccessSpecs } from '../types'
import type { OsmData } from '../lib/osmDetails'
import {
  CheckCircle2, XCircle, MinusCircle, DoorOpen, Zap, Toilet,
  Car, Footprints, MapPin, ExternalLink,
} from 'lucide-react'

interface Props { specs: AccessSpecs[]; osmData?: OsmData }

function timeAgo(ms: number) {
  const d = Math.floor((Date.now() - ms) / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  return new Date(ms).toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

const YN = ({ v }: { v?: boolean }) =>
  v === true
    ? <span className="inline-flex items-center gap-1 text-[#1e7d35] font-medium"><CheckCircle2 size={13} /> Yes</span>
    : v === false
    ? <span className="inline-flex items-center gap-1 text-[#c5221f] font-medium"><XCircle size={13} /> No</span>
    : <span className="inline-flex items-center gap-1 text-[#9aa0a6]"><MinusCircle size={13} /> Unknown</span>

const RAMP_GRADIENT: Record<string, string> = { gentle: 'Gentle (≤5%)', moderate: 'Moderate (5–10%)', steep: 'Steep (>10%) ⚠' }
const DOOR_TYPE: Record<string, string> = { automatic: 'Automatic', manual: 'Manual', heavy_manual: 'Heavy manual ⚠', revolving: 'Revolving ⚠' }
const SURFACE: Record<string, string> = { smooth: 'Smooth / tiles', carpet: 'Carpet', uneven: 'Uneven', cobblestone: 'Cobblestone ⚠', gravel: 'Gravel ⚠' }

export default function SpecsPanel({ specs, osmData }: Props) {
  const hasOsm = osmData && (Object.keys(osmData.specs).length > 0 || osmData.extras.length > 0)

  if (specs.length === 0 && !hasOsm) return (
    <p className="py-4 text-sm text-muted">No physical specs yet — be the first to add details!</p>
  )

  const merged: Partial<AccessSpecs> = {}
  for (const s of [...specs].reverse()) Object.assign(merged, s)
  const photos = specs.flatMap(s => s.photos ?? [])

  return (
    <div className="space-y-5">
      {/* OSM baseline */}
      {hasOsm && (() => {
        const s = osmData!.specs
        const osmId = osmData!.osmId
        const rows: { label: string; value: React.ReactNode }[] = []
        if (s.hasStepFreeEntrance != null) rows.push({ label: 'Step-free entrance', value: <YN v={s.hasStepFreeEntrance} /> })
        if (s.entranceStepCount != null) rows.push({ label: 'Steps at entrance', value: <span>{s.entranceStepCount}</span> })
        if (s.stepHeightCm) rows.push({ label: 'Step height', value: <span>{s.stepHeightCm} cm each</span> })
        if (s.kerbType) rows.push({ label: 'Kerb type', value: <span className="capitalize">{s.kerbType}</span> })
        if (s.rampPresent != null) rows.push({ label: 'Ramp', value: <YN v={s.rampPresent} /> })
        if (s.rampGradient) rows.push({ label: 'Ramp gradient', value: <span>{RAMP_GRADIENT[s.rampGradient]}</span> })
        if (s.rampWidthCm) rows.push({ label: 'Ramp width', value: <span>{s.rampWidthCm} cm</span> })
        if (s.rampHasHandrails != null) rows.push({ label: 'Ramp handrails', value: <YN v={s.rampHasHandrails} /> })
        if (s.doorWidthCm) rows.push({ label: 'Door clear width', value: <span>{s.doorWidthCm} cm</span> })
        if (s.doorType) rows.push({ label: 'Door type', value: <span>{DOOR_TYPE[s.doorType]}</span> })
        if (s.hasLift != null) rows.push({ label: 'Lift / elevator', value: <YN v={s.hasLift} /> })
        if (s.liftDoorWidthCm) rows.push({ label: 'Lift door width', value: <span>{s.liftDoorWidthCm} cm</span> })
        if (s.liftDepthCm) rows.push({ label: 'Lift depth', value: <span>{s.liftDepthCm} cm</span> })
        if (s.hasAccessibleToilet != null) rows.push({ label: 'Accessible toilet', value: <YN v={s.hasAccessibleToilet} /> })
        if (s.toiletGrabRails != null) rows.push({ label: 'Toilet grab rails', value: <YN v={s.toiletGrabRails} /> })
        if (s.turningSpaceCm) rows.push({ label: 'WC turning space', value: <span>{s.turningSpaceCm} cm</span> })
        if (s.floorSurface) rows.push({ label: 'Floor surface', value: <span>{SURFACE[s.floorSurface]}</span> })
        if (s.hasTactilePaving != null) rows.push({ label: 'Tactile paving', value: <YN v={s.hasTactilePaving} /> })
        if (s.hasDisabledParking != null) rows.push({ label: 'Disabled parking', value: <YN v={s.hasDisabledParking} /> })
        if (s.disabledParkingSpaces) rows.push({ label: 'Parking spaces', value: <span>{s.disabledParkingSpaces}</span> })

        return (
          <div className="overflow-hidden rounded-2xl border border-[#c2d7f5] bg-[#f0f6ff]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#c2d7f5]">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#1a73e8]" />
                <span className="text-xs font-semibold text-[#1a73e8] uppercase tracking-wide">OpenStreetMap data</span>
              </div>
              {osmId && (
                <a href={`https://www.openstreetmap.org/${osmId}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#1a73e8] hover:underline">
                  Edit on OSM <ExternalLink size={10} />
                </a>
              )}
            </div>
            {rows.length > 0
              ? <div className="divide-y divide-[#dce8f9]">
                  {rows.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-[#5f6368]">{label}</span>
                      <span className="font-medium text-[#202124]">{value}</span>
                    </div>
                  ))}
                </div>
              : <p className="px-4 py-3 text-sm text-[#5f6368]">No detailed data in OpenStreetMap yet.</p>
            }
            <p className="px-4 py-2 text-[10px] text-[#9aa0a6] border-t border-[#dce8f9]">
              OSM data © OpenStreetMap contributors (ODbL)
            </p>
          </div>
        )
      })()}

      {/* Community contributions */}
      {specs.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#9aa0a6]">Community contributions</p>

          {photos.length > 0 && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {photos.map((url, i) => (
                <img key={i} src={url} alt={`Accessibility photo ${i + 1}`}
                  className="h-28 w-28 shrink-0 rounded-xl object-cover border border-[#e8eaed]" />
              ))}
            </div>
          )}

          <div className="space-y-3">
            <SpecSection title="Entrance" icon={DoorOpen}>
              <Row label="Step-free entrance"><YN v={merged.hasStepFreeEntrance} /></Row>
              {merged.entranceStepCount != null && <Row label="Steps">{merged.entranceStepCount}</Row>}
              {merged.stepHeightCm && <Row label="Step height">{merged.stepHeightCm} cm each</Row>}
              <Row label="Ramp"><YN v={merged.rampPresent} /></Row>
              {merged.rampGradient && <Row label="Ramp gradient">{RAMP_GRADIENT[merged.rampGradient]}</Row>}
              {merged.rampHasHandrails != null && <Row label="Handrails"><YN v={merged.rampHasHandrails} /></Row>}
              {merged.doorWidthCm && <Row label="Door width">{merged.doorWidthCm} cm</Row>}
              {merged.doorType && <Row label="Door type">{DOOR_TYPE[merged.doorType]}</Row>}
            </SpecSection>

            <SpecSection title="Inside" icon={Zap}>
              <Row label="Lift / elevator"><YN v={merged.hasLift} /></Row>
              {merged.liftDoorWidthCm && <Row label="Lift door width">{merged.liftDoorWidthCm} cm</Row>}
              {merged.corridorWidthCm && <Row label="Narrowest corridor">{merged.corridorWidthCm} cm</Row>}
              <Row label="Accessible toilet"><YN v={merged.hasAccessibleToilet} /></Row>
              {merged.hasAccessibleToilet && <Row label="Grab rails"><YN v={merged.toiletGrabRails} /></Row>}
              {merged.turningSpaceCm && <Row label="WC turning space">{merged.turningSpaceCm} cm</Row>}
            </SpecSection>

            {(merged.floorSurface || merged.hasTactilePaving != null) && (
              <SpecSection title="Surfaces" icon={Footprints}>
                {merged.floorSurface && <Row label="Floor surface">{SURFACE[merged.floorSurface]}</Row>}
                {merged.hasTactilePaving != null && <Row label="Tactile paving"><YN v={merged.hasTactilePaving} /></Row>}
              </SpecSection>
            )}

            {(merged.hasDisabledParking != null || merged.parkingDistanceM != null) && (
              <SpecSection title="Parking" icon={Car}>
                <Row label="Disabled bays"><YN v={merged.hasDisabledParking} /></Row>
                {merged.parkingDistanceM != null && <Row label="Distance to entrance">{merged.parkingDistanceM} m</Row>}
              </SpecSection>
            )}
          </div>

          {merged.notes && (
            <div className="mt-3 rounded-xl bg-[#f8f9fa] border border-[#e8eaed] p-3 text-sm text-[#5f6368] italic">
              "{merged.notes}"
            </div>
          )}

          <p className="mt-3 text-[11px] text-[#9aa0a6]">
            {specs.length} contribution{specs.length !== 1 ? 's' : ''} · last updated {timeAgo(specs[0].contributedAt)} by {specs[0].contributedBy}
          </p>
        </div>
      )}
    </div>
  )
}

function SpecSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e8eaed]">
      <div className="flex items-center gap-2 border-b border-[#e8eaed] bg-[#f8f9fa] px-3 py-2">
        <Icon size={13} className="text-[#9aa0a6]" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]">{title}</span>
      </div>
      <div className="divide-y divide-[#f1f3f4]">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 text-sm">
      <span className="text-[#5f6368]">{label}</span>
      <span className="font-medium text-[#202124]">{children}</span>
    </div>
  )
}
