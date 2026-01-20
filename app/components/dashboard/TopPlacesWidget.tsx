'use client'

import { money } from '@utils'
import { useEffect, useMemo, useState } from 'react'
import { Period, WidgetPeriodToggle } from './WidgetPeriodToggle'

type TopPlace = {
  place_id: string
  name: string | null
  total_spent: string
  visit_count: number
}

export default function TopPlacesWidget() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<TopPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const qs = useMemo(() => new URLSearchParams({ period }).toString(), [period])

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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Top places</h2>
          <div className="text-xs text-neutral-500">Period: {period}</div>
        </div>
        <WidgetPeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="text-sm text-neutral-500">Loading…</div>
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
