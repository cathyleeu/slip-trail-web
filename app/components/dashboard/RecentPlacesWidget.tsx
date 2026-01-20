'use client'

import { useEffect, useState } from 'react'

type RecentPlace = {
  place_id: string
  name: string | null
  last_visited_at: string | null
}

export default function RecentPlacesWidget() {
  const [data, setData] = useState<RecentPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/dashboard/recent-places`)
        const json = (await res.json()) as {
          success: boolean
          data?: RecentPlace[]
          error?: string
        }

        if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to load recent places')
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
  }, [])

  return (
    <section className="rounded-2xl border bg-white p-4">
      <div>
        <h2 className="font-semibold">Recent places</h2>
        <div className="text-xs text-neutral-500">Latest visits</div>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-neutral-500">No recent places yet.</div>
        ) : (
          <ul className="space-y-2">
            {data.slice(0, 8).map((p) => (
              <li key={p.place_id} className="rounded-2xl border p-3">
                <div className="font-medium">{p.name ?? 'Unknown place'}</div>
                <div className="text-xs text-neutral-500">
                  {p.last_visited_at ? new Date(p.last_visited_at).toLocaleString() : '—'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
