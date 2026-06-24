import type { CompatibilityResult } from '../types'
import { GRADE_COLOR, GRADE_LABEL } from '../lib/compatibility'

interface Props {
  result: CompatibilityResult
  size?: 'sm' | 'md'
}

export default function MatchBadge({ result, size = 'sm' }: Props) {
  const color = GRADE_COLOR[result.grade]
  if (size === 'sm') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
        style={{ background: color }}
        title={`${GRADE_LABEL[result.grade]} for your needs (${result.score}%)`}
        aria-label={`${GRADE_LABEL[result.grade]} — ${result.score}% match for your accessibility needs`}
      >
        For you: {result.score}%
      </span>
    )
  }
  return (
    <div className="rounded-2xl border-2 p-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            {GRADE_LABEL[result.grade]}
          </p>
          <p className="mt-0.5 text-2xl font-bold" style={{ color }}>{result.score}%</p>
          <p className="text-xs text-muted">match for your needs</p>
        </div>
        <svg viewBox="0 0 40 40" className="h-14 w-14" aria-hidden="true">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="4" />
          <circle
            cx="20" cy="20" r="16" fill="none"
            stroke={color} strokeWidth="4"
            strokeDasharray={`${(result.score / 100) * 100.5} 100.5`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
          />
        </svg>
      </div>
      {result.highlights.length > 0 && (
        <ul className="mt-3 space-y-1">
          {result.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-green-700">
              <span className="mt-0.5 shrink-0">✓</span> {h}
            </li>
          ))}
        </ul>
      )}
      {result.warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {result.warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-orange-700">
              <span className="mt-0.5 shrink-0">⚠</span> {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
