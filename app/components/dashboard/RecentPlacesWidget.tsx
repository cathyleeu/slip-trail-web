'use client'

import { useDashboardRecentPlaces } from '@hooks/useDashboard'
import { memo } from 'react'

const RecentPlacesWidget = memo(function RecentPlacesWidget() {
  const { data = [], isLoading, error } = useDashboardRecentPlaces()

  return (
    <section className="rounded-2xl border bg-white p-4">
      <div>
        <h2 className="font-semibold">Recent places</h2>
        <div className="text-xs text-neutral-500">Latest visits</div>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error.message}</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-neutral-500">No recent places yet.</div>
        ) : (
          <ul className="space-y-2">
            {data.slice(0, 8).map((p) => (
              <li key={p.place_name} className="rounded-2xl border p-3">
                <div className="font-medium">{p.place_name ?? 'Unknown place'}</div>
                <div className="text-xs text-neutral-500">
                  {p.last_visited ? new Date(p.last_visited).toLocaleString() : '—'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
})

export default RecentPlacesWidget
