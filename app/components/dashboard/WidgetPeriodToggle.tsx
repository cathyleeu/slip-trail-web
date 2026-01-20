'use client'

export type Period = 'day' | 'week' | 'month'

export function WidgetPeriodToggle({
  value,
  onChange,
}: {
  value: Period
  onChange: (v: Period) => void
}) {
  const opts: { v: Period; label: string }[] = [
    { v: 'day', label: 'Day' },
    { v: 'week', label: 'Week' },
    { v: 'month', label: 'Month' },
  ]

  return (
    <div className="inline-flex rounded-xl border bg-white p-1">
      {opts.map((o) => {
        const active = o.v === value
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={[
              'px-3 py-1 text-sm rounded-lg transition',
              active ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100',
            ].join(' ')}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
