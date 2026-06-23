import { useStore, FILTER_LABELS } from '../store/useStore'

export default function AccessibilityFilter() {
  const filters = useStore((s) => s.filters)
  const toggle = useStore((s) => s.toggleFilter)
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTER_LABELS.map(({ key, label }) => {
        const active = filters.has(key)
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-[background-color,color,border-color] duration-150 ${
              active
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-card text-muted hover:border-primary/50 hover:text-ink'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
