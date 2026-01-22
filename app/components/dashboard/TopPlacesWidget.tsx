'use client'

import { Period } from '@types'
import { money } from '@utils'
import { useEffect, useMemo, useState } from 'react'
import { Skeleton } from '../Skeleton'
import { WidgetPeriodToggle } from './WidgetPeriodToggle'

type SortBy = 'spend' | 'visits'

type TopPlace = {
  place_id: string
  name: string | null
  total_spent: string
  visit_count: number
}

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

export default function TopPlacesWidget() {
  const [period, setPeriod] = useState<Period>('last30')
  const [sortBy, setSortBy] = useState<SortBy>('spend')
  const [data, setData] = useState<TopPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    p.set('period', period)
    p.set('sort', sortBy) // ✅ 서버가 이걸 처리하게
    return p.toString()
  }, [period, sortBy])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/dashboard/top-places?${qs}`)
        const json = (await res.json()) as { success: boolean; data?: TopPlace[]; error?: string }
        if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to load top places')
        if (!cancelled) setData(json.data ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [qs])

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
        {loading ? (
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
          <div className="text-sm text-red-600">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-neutral-500">No data yet.</div>
        ) : (
          <ul className="space-y-2">
            {data.slice(0, 8).map((p) => (
              <li key={p.place_id} className="rounded-2xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{p.name ?? 'Unknown place'}</div>
                    <div className="text-xs text-neutral-500">{p.visit_count} visits</div>
                  </div>
                  <div className="text-sm font-semibold">{money(p.total_spent)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
