import { useEffect, useState } from 'react'

interface Props {
  score: number // 0-10
  label: string
  size?: number
}

export function scoreColor(score: number): string {
  if (score >= 8) return '#22c55e'
  if (score >= 5) return '#eab308'
  return '#FF6B47'
}

/** Animated SVG progress ring (0 → score on mount). */
export default function ScoreRing({ score, label, size = 96 }: Props) {
  const [shown, setShown] = useState(0)
  const radius = (size - 12) / 2
  const circ = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(10, shown)) / 10
  const color = scoreColor(score)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(score))
    return () => cancelAnimationFrame(id)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e3e6ea" strokeWidth={8} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl" style={{ color }}>
            {score.toFixed(score % 1 ? 1 : 0)}
          </span>
        </div>
      </div>
      <span className="label">{label}</span>
    </div>
  )
}
