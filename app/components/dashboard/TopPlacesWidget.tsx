'use client'

import { useDashboardTopPlaces } from '@hooks/useDashboard'
import { Period } from '@types'
import { money } from '@utils'
import { memo, useMemo, useState } from 'react'
import { Skeleton } from '../Skeleton'
import { WidgetPeriodToggle } from './WidgetPeriodToggle'

type SortBy = 'spend' | 'visits'

function SortTabs({ value, onChange }: { value: SortBy; onChange: (v: SortBy) => void }) {
  const tabs: { v: SortBy; label: string }[] = [
    { v: 'spend', label: 'Spend' },
    { v: 'visits', label: 'Visits' },
  ]
  return (
    <div className="inline-flex rounded-xl border bg-white p-1">
      {tabs.map((t) => {
        const active = t.v === value
        return (
          <button
            key={t.v}
            type="button"
            onClick={() => onChange(t.v)}
            className={[
              'px-3 py-1 text-sm rounded-lg transition',
              active ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100',
            ].join(' ')}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

const TopPlacesWidget = memo(function TopPlacesWidget() {
  const [period, setPeriod] = useState<Period>('last30')
  const [sortBy, setSortBy] = useState<SortBy>('spend')
  const { data = [], isLoading, error } = useDashboardTopPlaces(period)

  // 클라이언트 사이드 정렬 (서버에서 정렬을 지원하지 않는 경우)
  const sortedData = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => {
      if (sortBy === 'spend') {
        return parseFloat(b.total) - parseFloat(a.total)
      }
      return b.count - a.count
    })
  }, [data, sortBy])

  return (
    <section className="rounded-2xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Top places</h2>
          <div className="text-xs text-neutral-500">Rank by spend or visits</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <WidgetPeriodToggle value={period} onChange={setPeriod} />
          <SortTabs value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <ul className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="rounded-2xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="text-sm text-red-600">{error.message}</div>
        ) : sortedData.length === 0 ? (
          <div className="text-sm text-neutral-500">No data yet.</div>
        ) : (
          <ul className="space-y-2">
            {sortedData.slice(0, 10).map((p) => (
              <li key={p.place_name} className="rounded-2xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium">{p.place_name ?? 'Unknown place'}</div>
                    <div className="text-xs text-neutral-500">{p.count} visits</div>
                  </div>
                  <div className="text-sm font-semibold">{money(p.total)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
})

export default TopPlacesWidget
