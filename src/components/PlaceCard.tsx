import { Link } from 'react-router-dom'
import { MapPin as MapPinIcon, AlertTriangle, Mountain } from 'lucide-react'
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

const TERRAIN_LABELS = ['', 'Flat', 'Mostly Flat', 'Some Slopes', 'Hilly', 'Steep']
const TERRAIN_COLORS = ['', '#1e8e3e', '#3d8b40', '#f29900', '#e67c00', '#ea4335']

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#1e8e3e', moderate: '#f29900', hard: '#e67c00', expert: '#ea4335',
}

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
      <div className="mt-3 flex items-center gap-3 flex-wrap">
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
        {place.terrainRating && (
          <div className="flex items-center gap-1.5">
            <Mountain size={11} style={{ color: TERRAIN_COLORS[place.terrainRating] }} />
            <span className="font-mono text-xs text-muted" style={{ color: TERRAIN_COLORS[place.terrainRating] }}>
              {TERRAIN_LABELS[place.terrainRating]}
            </span>
          </div>
        )}
        {place.trailDifficulty && (
          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white capitalize"
            style={{ background: DIFFICULTY_COLORS[place.trailDifficulty] }}>
            {place.trailDifficulty}
          </span>
        )}
      </div>
    </Link>
  )
}
