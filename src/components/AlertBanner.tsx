import { AlertTriangle, Check } from 'lucide-react'
import type { Alert } from '../types'
import { useStore } from '../store/useStore'

function timeAgo(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const TYPE_LABEL: Record<Alert['type'], string> = {
  elevator: 'Elevator',
  ramp: 'Ramp',
  bathroom: 'Bathroom',
  noise: 'Noise level',
  obstruction: 'Obstruction',
  other: 'Issue',
}

interface Props {
  alert: Alert
  onResolve?: (id: string) => void
}

export default function AlertBanner({ alert, onResolve }: Props) {
  const user = useStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  return (
    <div className="flex items-center gap-3 rounded-xl border border-alert/40 bg-alert/10 px-4 py-3 animate-alert-glow">
      <AlertTriangle className="shrink-0 text-alert" size={20} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">
          <span className="font-semibold text-alert">{TYPE_LABEL[alert.type]} — </span>
          {alert.description}
        </p>
        <p className="label mt-0.5">
          reported {timeAgo(alert.createdAt)} · by {alert.reportedBy} ·{' '}
          {alert.aiVerified ? 'AI verified' : 'unverified'}
        </p>
      </div>
      {isAdmin && onResolve && (
        <button onClick={() => onResolve(alert.id)} className="btn-ghost shrink-0 px-3 py-1.5 text-sm">
          <Check size={16} /> Resolve
        </button>
      )}
    </div>
  )
}
