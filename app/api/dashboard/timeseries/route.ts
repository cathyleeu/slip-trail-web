import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { supabaseServer } from '@lib/supabase/server'

function rangeFromPeriod(period: string) {
  const now = new Date()
  const to = now.toISOString()

  // 간단 버전: day=최근 1일, week=7일, month=30일
  const days = period === 'day' ? 1 : period === 'week' ? 7 : 30
  const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const from = fromDate.toISOString()

  return { from, to }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const period = url.searchParams.get('period') ?? 'month'
    const bucket = url.searchParams.get('bucket') ?? 'day'

    const supabase = await supabaseServer()
    const auth = await requireAuth(supabase)
    if (!auth.ok) return auth.response

    const { from, to } = rangeFromPeriod(period)

    const { data, error } = await supabase.rpc('dashboard_timeseries', {
      from_ts: from,
      to_ts: to,
      bucket,
    })

    if (error) return apiError('Failed to load timeseries', { status: 500, details: error.message })
    return apiSuccess(data ?? [])
  } catch (e) {
    return apiError('Unexpected error', {
      status: 500,
      details: e instanceof Error ? e.message : String(e),
    })
  }
}
