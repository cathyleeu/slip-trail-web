import SpendChart from '@components/dashboard/SpendChart'
import { supabaseServer } from '@lib/supabase/server'
import { PlaceRow, SeriesRow, SummaryRow } from '@types'
import { money } from '@utils'
import { redirect } from 'next/navigation'

function isoRange(period: 'day' | 'week' | 'month') {
  const now = new Date()
  const to = new Date(now)
  const from = new Date(now)

  if (period === 'day') from.setDate(from.getDate() - 1)
  if (period === 'week') from.setDate(from.getDate() - 7)
  if (period === 'month') from.setMonth(from.getMonth() - 1)

  return { from_ts: from.toISOString(), to_ts: to.toISOString() }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: 'day' | 'week' | 'month'; bucket?: 'day' | 'week' | 'month' }>
}) {
  const params = await searchParams
  const period = params.period ?? 'month'
  const bucket = params.bucket ?? 'day'
  const { from_ts, to_ts } = isoRange(period)

  const supabase = await supabaseServer()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const [summaryRes, seriesRes, recentRes, topRes, momRes] = await Promise.all([
    supabase.rpc('dashboard_summary', { from_ts, to_ts }),
    supabase.rpc('dashboard_timeseries', { from_ts, to_ts, bucket }),
    supabase.rpc('dashboard_recent_places', { limit_n: 10 }),
    supabase.rpc('dashboard_top_places', { from_ts, to_ts, limit_n: 10 }),
    supabase.rpc('dashboard_mom'),
  ])

  if (summaryRes.error) throw new Error(summaryRes.error.message)
  if (seriesRes.error) throw new Error(seriesRes.error.message)
  if (recentRes.error) throw new Error(recentRes.error.message)
  if (topRes.error) throw new Error(topRes.error.message)
  if (momRes.error) throw new Error(momRes.error.message)

  const summary = (summaryRes.data?.[0] ?? {
    total_spent: '0',
    receipt_count: 0,
    avg_receipt: '0',
  }) as SummaryRow

  const series = (seriesRes.data ?? []) as SeriesRow[]
  const recentPlaces = (recentRes.data ?? []) as PlaceRow[]
  const topPlaces = (topRes.data ?? []) as PlaceRow[]
  const mom = (momRes.data?.[0] ?? null) as {
    current_total: string
    previous_total: string
    pct_change: string | null
    top_place_id: string | null
    top_place_name: string | null
    top_place_increase: string | null
  } | null

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-sm text-neutral-500">
            Period: <span className="font-medium">{period}</span> · Bucket:{' '}
            <span className="font-medium">{bucket}</span>
          </div>
        </div>
      </header>

      {/* Summary cards */}
      <section className="grid gap-3 md:grid-cols-3">
        <Card title="Total spent" value={money(summary.total_spent)} />
        <Card title="Receipts" value={String(summary.receipt_count)} />
        <Card title="Avg receipt" value={money(summary.avg_receipt)} />
      </section>

      {/* Chart */}
      <section className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Spending over time</h2>
          <div className="text-xs text-neutral-500">CAD</div>
        </div>
        <div className="mt-3">
          <SpendChart
            points={series.map((r) => ({
              label: r.bucket_start,
              total: Number(r.total_spent),
            }))}
          />
        </div>
      </section>

      {/* Lists */}
      <section className="grid gap-3 md:grid-cols-2">
        <Panel title="Recent places">
          <PlaceList
            rows={recentPlaces.map((p) => ({
              title: p.name ?? 'Unknown',
              subtitle: p.normalized_address ?? '',
              right: p.last_visited_at ? new Date(p.last_visited_at).toLocaleDateString() : '—',
            }))}
          />
        </Panel>

        <Panel title="Top places (by visits)">
          <PlaceList
            rows={topPlaces.map((p) => ({
              title: p.name ?? 'Unknown',
              subtitle: p.normalized_address ?? '',
              right: `${p.visit_count ?? 0} visits · ${money(p.total_spent ?? '0')}`,
            }))}
          />
        </Panel>
      </section>

      {/* Next “report ideas” slot */}
      <section className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold">Next reports to add</h2>
        <ul className="mt-2 text-sm text-neutral-600 list-disc pl-5 space-y-1">
          <li>Tip rate (avg tip %, max tip receipt)</li>
          <li>Category breakdown (Food vs Grocery etc.)</li>
          <li>Weekday spending pattern</li>
          <li>Month-over-month change (+/-%), biggest increase place</li>
          <li>Outlier receipts (unusually high total)</li>
        </ul>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold">Month-over-month</h2>

        {!mom ? (
          <div className="mt-2 text-sm text-neutral-500">No data yet.</div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-neutral-500">This month</div>
              <div className="mt-1 text-2xl font-semibold">{money(mom.current_total)}</div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-sm text-neutral-500">Last month</div>
              <div className="mt-1 text-2xl font-semibold">{money(mom.previous_total)}</div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-sm text-neutral-500">Change</div>
              <div className="mt-1 text-2xl font-semibold">
                {mom.pct_change === null ? '—' : `${Number(mom.pct_change).toFixed(1)}%`}
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                {mom.top_place_name
                  ? `Biggest increase: ${mom.top_place_name} (+${money(
                      mom.top_place_increase ?? '0'
                    )})`
                  : 'No place increase data yet.'}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function PlaceList({ rows }: { rows: { title: string; subtitle: string; right: string }[] }) {
  if (rows.length === 0) return <div className="text-sm text-neutral-500">No data yet.</div>

  return (
    <ul className="divide-y">
      {rows.map((r, i) => (
        <li key={i} className="py-3 flex items-start justify-between gap-3">
          <div>
            <div className="font-medium">{r.title}</div>
            <div className="text-xs text-neutral-500 line-clamp-2">{r.subtitle}</div>
          </div>
          <div className="text-xs text-neutral-500 whitespace-nowrap">{r.right}</div>
        </li>
      ))}
    </ul>
  )
}
