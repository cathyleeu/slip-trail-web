'use client'

import type { Period, SpendSeriesResponse } from '@types'
import { useEffect, useMemo, useState } from 'react'
import { Skeleton } from '../Skeleton'
import SpendChart from './SpendChart'
import { WidgetPeriodToggle } from './WidgetPeriodToggle'

function isSpendSeriesResponse(x: unknown): x is SpendSeriesResponse {
  if (typeof x !== 'object' || x === null) return false
  const obj = x as Record<string, unknown>
  if (!Array.isArray(obj.points)) return false
  return true
}

export default function SpendChartWidget() {
  const [period, setPeriod] = useState<Period>('last30')
  const [data, setData] = useState<SpendSeriesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const qs = useMemo(() => new URLSearchParams({ period }).toString(), [period])

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/dashboard/spend-series?${qs}`)
        const json: unknown = await res.json().catch(() => null)

        if (!res.ok) {
          const msg =
            typeof json === 'object' && json !== null && 'error' in json
              ? String((json as { error?: unknown }).error ?? 'Failed to load')
              : 'Failed to load'
          throw new Error(msg)
        }

        // apiSuccess/apiError wrapper 대응: { success, data }
        const maybe = json as { success?: boolean; data?: unknown; error?: unknown }
        const payload = maybe?.success ? maybe.data : json

        if (!isSpendSeriesResponse(payload)) throw new Error('Invalid spend series response')

        if (!cancelled) setData(payload)
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
          <h2 className="font-semibold">Spend over time</h2>
          <div className="text-xs text-neutral-500">Last 7 / 30 days or YTD</div>
        </div>
        <WidgetPeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="rounded-2xl border p-3">
            <Skeleton className="h-56 w-full" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : !data || data.points.length === 0 ? (
          <div className="text-sm text-neutral-500">No data yet.</div>
        ) : (
          <div className="rounded-2xl border p-3">
            <SpendChart points={data.points} />
          </div>
        )}
      </div>
    </section>
  )
}
