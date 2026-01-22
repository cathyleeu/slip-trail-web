import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { supabaseServer } from '@lib/supabase/server'
import { rangeFromPeriod } from '@utils/range'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const period = url.searchParams.get('period') ?? 'month'
    const { from, to } = rangeFromPeriod(period)

    const supabase = await supabaseServer()
    const auth = await requireAuth(supabase)
    if (!auth.ok) return auth.response

    const { data, error } = await supabase.rpc('dashboard_top_places', {
      from_ts: from,
      to_ts: to,
      limit_n: 10,
    })

    if (error) return apiError('Failed to load top places', { status: 500, details: error.message })
    return apiSuccess(data ?? [])
  } catch (e) {
    return apiError('Unexpected error', {
      status: 500,
      details: e instanceof Error ? e.message : String(e),
    })
  }
}
