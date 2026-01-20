'use client'

import { money, pct } from '@utils'
import { useEffect, useState } from 'react'

type MoM = {
  current_total: string
  previous_total: string
  pct_change: string | null
  top_place_name: string | null
  top_place_increase: string | null
}

export default function MoMWidget() {
  const [data, setData] = useState<MoM | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/dashboard/mom`)
        const json = (await res.json()) as { success: boolean; data?: MoM; error?: string }

        if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to load MoM')
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
  }, [])

  return (
    <section className="rounded-2xl border bg-white p-4">
      <div>
        <h2 className="font-semibold">Month-over-month</h2>
        <div className="text-xs text-neutral-500">This month vs last month</div>
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
              <div className="text-xs text-neutral-500">This month</div>
              <div className="mt-1 text-lg font-semibold">{money(data.current_total)}</div>
            </div>

            <div className="rounded-2xl border p-3">
              <div className="text-xs text-neutral-500">Last month</div>
              <div className="mt-1 text-lg font-semibold">{money(data.previous_total)}</div>
            </div>

            <div className="rounded-2xl border p-3">
              <div className="text-xs text-neutral-500">Change</div>
              <div className="mt-1 text-lg font-semibold">{pct(data.pct_change)}</div>
              <div className="mt-2 text-xs text-neutral-500">
                {data.top_place_name
                  ? `Biggest increase: ${data.top_place_name} (+${money(
                      data.top_place_increase ?? '0'
                    )})`
                  : 'No place increase yet.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
