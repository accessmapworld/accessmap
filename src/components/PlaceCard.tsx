import { Link } from 'react-router-dom'
import { MapPin as MapPinIcon, AlertTriangle } from 'lucide-react'
import type { Place, Dimension } from '../types'
import { scoreColor } from './ScoreRing'

interface Props {
  place: Place
  hasAlert?: boolean
  style?: React.CSSProperties
}

const DIMS: { key: Dimension; label: string }[] = [
  { key: 'mobility', label: 'M' },
  { key: 'sensory', label: 'S' },
  { key: 'hearing', label: 'H' },
  { key: 'vision', label: 'V' },
]

export default function PlaceCard({ place, hasAlert, style }: Props) {
  return (
    <Link
      to={`/place/${place.id}`}
      style={style}
      className="card block p-4 transition-[transform,box-shadow] duration-[180ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg leading-tight">{place.name}</h3>
        {hasAlert && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-alert/15 px-2 py-0.5 text-xs text-alert">
            <AlertTriangle size={12} /> Alert
          </span>
        )}
      </div>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted">
        <MapPinIcon size={13} /> {place.address}
      </p>
      <div className="mt-3 flex items-center gap-3">
        {DIMS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: scoreColor(place.scores[key]) }}
            />
            <span className="font-mono text-xs text-muted">
              {label} {place.scores[key]}
            </span>
          </div>
        ))}
      </div>
    </Link>
  )
}
