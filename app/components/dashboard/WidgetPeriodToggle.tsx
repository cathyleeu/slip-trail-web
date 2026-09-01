'use client'

import { SegmentToggle } from '@components/ui'
import { Period } from '@types'

export function WidgetPeriodToggle({
  value,
  onChange,
}: {
  value: Period
  onChange: (v: Period) => void
}) {
  const opts: { value: Period; label: string }[] = [
    { value: 'last7', label: 'Last 7 days' },
    { value: 'last30', label: 'Last 30 days' },
    { value: 'ytd', label: 'YTD' },
  ]

  return (
    <SegmentToggle
      options={opts}
      value={value}
      onChange={onChange}
      className="border border-border"
      optionClassName="px-3 py-1 text-sm rounded-lg"
    />
  )
}
