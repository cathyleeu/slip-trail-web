'use client'

import { useDashboardMoM } from '@hooks/useDashboard'
import { money, pct } from '@utils'
import { memo } from 'react'

const MoMWidget = memo(function MoMWidget() {
  const { data, isLoading, error } = useDashboardMoM()

  return (
    <section className="rounded-2xl border bg-white p-4">
      <div>
        <h2 className="font-semibold">Month-over-month</h2>
        <div className="text-xs text-neutral-500">This month vs last month</div>
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
              <div className="text-xs text-neutral-500">This month</div>
              <div className="mt-1 text-lg font-semibold">{money(data.current_total)}</div>
            </div>
            <div className="rounded-2xl border p-3">
              <div className="text-xs text-neutral-500">Last month</div>
              <div className="mt-1 text-lg font-semibold">{money(data.previous_total)}</div>
            </div>
            <div className="rounded-2xl border p-3">
              <div className="text-xs text-neutral-500">Change</div>
              <div
                className={`mt-1 text-lg font-semibold ${
                  data.pct_change && parseFloat(data.pct_change) > 0
                    ? 'text-red-600'
                    : data.pct_change && parseFloat(data.pct_change) < 0
                    ? 'text-green-600'
                    : ''
                }`}
              >
                {data.pct_change ? pct(data.pct_change) : '-'}
              </div>
            </div>
          </div>
        )}
      </div>

      {data?.top_place_name && (
        <div className="mt-3 rounded-xl bg-neutral-50 p-3">
          <div className="text-xs text-neutral-500">Biggest increase</div>
          <div className="mt-1 text-sm font-semibold">{data.top_place_name}</div>
          <div className="mt-0.5 text-xs text-neutral-600">
            +{money(data.top_place_increase ?? '0')}
          </div>
        </div>
      )}
    </section>
  )
})

export default MoMWidget
