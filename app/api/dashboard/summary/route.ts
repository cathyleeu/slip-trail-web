import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { supabaseServer } from '@lib/supabase/server'

function rangeFromPeriod(period: string) {
  const now = new Date()
  const to = now.toISOString()
  const days = period === 'day' ? 1 : period === 'week' ? 7 : 30
  const from = new Date(now.getTime() - days * 86400000).toISOString()
  return { from, to }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const period = url.searchParams.get('period') ?? 'month'
    const { from, to } = rangeFromPeriod(period)

    const supabase = await supabaseServer()
    const auth = await requireAuth(supabase)
    if (!auth.ok) return auth.response

    const { data, error } = await supabase.rpc('dashboard_summary', {
      from_ts: from,
      to_ts: to,
    })

    if (error) return apiError('Failed to load summary', { status: 500, details: error.message })
    return apiSuccess((data?.[0] ?? null) as unknown)
  } catch (e) {
    return apiError('Unexpected error', {
      status: 500,
      details: e instanceof Error ? e.message : String(e),
    })
  }
}
