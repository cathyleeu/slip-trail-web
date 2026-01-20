'use client'

import { money } from '@utils'
import { useEffect, useMemo, useState } from 'react'
import { Period, WidgetPeriodToggle } from './WidgetPeriodToggle'

type Summary = {
  total_spent: string
  receipt_count: number
  avg_per_receipt: string
}

export default function SummaryWidget() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const qs = useMemo(() => new URLSearchParams({ period }).toString(), [period])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/dashboard/summary?${qs}`)
        const json = (await res.json()) as { success: boolean; data?: Summary; error?: string }

        if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to load summary')
        if (!cancelled) setData(json.data ?? null)
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
          <h2 className="font-semibold">Summary</h2>
          <div className="text-xs text-neutral-500">Period: {period}</div>
        </div>
        <WidgetPeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : !data ? (
          <div className="text-sm text-neutral-500">No data yet.</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border p-3">
              <div className="text-xs text-neutral-500">Total</div>
              <div className="mt-1 text-lg font-semibold">{money(data.total_spent)}</div>
            </div>
            <div className="rounded-2xl border p-3">
              <div className="text-xs text-neutral-500">Receipts</div>
              <div className="mt-1 text-lg font-semibold">{data.receipt_count}</div>
            </div>
            <div className="rounded-2xl border p-3">
              <div className="text-xs text-neutral-500">Avg</div>
              <div className="mt-1 text-lg font-semibold">{money(data.avg_per_receipt)}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
