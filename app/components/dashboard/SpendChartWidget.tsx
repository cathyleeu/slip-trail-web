'use client'

import { useEffect, useMemo, useState } from 'react'
import { SpendChart } from './SpendChart'
import { WidgetPeriodToggle } from './WidgetPeriodToggle'

type Period = 'day' | 'week' | 'month'
type Row = { date: string; total: number; count: number }

export default function SpendChartWidget() {
  const [period, setPeriod] = useState<Period>('month')
  const [bucket, setBucket] = useState<'day' | 'week' | 'month'>('day')
  const [data, setData] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // period가 바뀌면 bucket을 “그럴듯하게” 자동 보정 (UX 좋음)
  useEffect(() => {
    if (period === 'day') setBucket('day')
    if (period === 'week') setBucket('day')
    if (period === 'month') setBucket('day')
  }, [period])

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    p.set('period', period)
    p.set('bucket', bucket)
    return p.toString()
  }, [period, bucket])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/dashboard/timeseries?${qs}`, { method: 'GET' })
        const json = (await res.json()) as { success: boolean; data?: Row[]; error?: string }

        if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to load')

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
          <h2 className="font-semibold">Spending over time</h2>
          <div className="text-xs text-neutral-500">Period: {period}</div>
        </div>

        <WidgetPeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <SpendChart data={data} />
        )}
      </div>
    </section>
  )
}
