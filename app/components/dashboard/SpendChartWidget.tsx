'use client'

import { useDashboardSpendSeries } from '@hooks/useDashboard'
import type { Period } from '@types'
import { memo, useState } from 'react'
import { Skeleton } from '../Skeleton'
import SpendChart from './SpendChart'
import { WidgetPeriodToggle } from './WidgetPeriodToggle'

const SpendChartWidget = memo(function SpendChartWidget() {
  const [period, setPeriod] = useState<Period>('last30')
  const { data, isLoading, error } = useDashboardSpendSeries(period)

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
        {isLoading ? (
          <div className="rounded-2xl border p-3">
            <Skeleton className="h-56 w-full" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error.message}</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-neutral-500">No data yet.</div>
        ) : (
          <div className="rounded-2xl border p-3">
            <SpendChart points={data} />
          </div>
        )}
      </div>
    </section>
  )
})

export default SpendChartWidget
