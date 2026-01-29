'use client'

import { useDashboardSummary } from '@hooks/useDashboard'
import { Period } from '@types'
import { money } from '@utils'
import { memo, useState } from 'react'
import { WidgetPeriodToggle } from './WidgetPeriodToggle'

const SummaryWidget = memo(function SummaryWidget() {
  const [period, setPeriod] = useState<Period>('last30')
  const { data, isLoading, error } = useDashboardSummary(period)

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
        {isLoading ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error.message}</div>
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
})

export default SummaryWidget
