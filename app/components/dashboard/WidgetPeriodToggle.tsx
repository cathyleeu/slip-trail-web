'use client'
import { Period } from '@types'

export function WidgetPeriodToggle({
  value,
  onChange,
}: {
  value: Period
  onChange: (v: Period) => void
}) {
  const opts: { v: Period; label: string }[] = [
    { v: 'last7', label: 'Last 7 days' },
    { v: 'last30', label: 'Last 30 days' },
    { v: 'ytd', label: 'YTD' },
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
              'px-3 py-1 text-sm rounded-lg transition whitespace-nowrap',
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
