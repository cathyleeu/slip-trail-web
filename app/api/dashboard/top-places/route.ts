import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { rangeFromPeriod } from '@utils/range'

export const GET = withAuth(async (req, { supabase }) => {
  const url = new URL(req.url)
  const period = url.searchParams.get('period') ?? 'month'
  const { from, to } = rangeFromPeriod(period)
  const sort = url.searchParams.get('sort') ?? 'spend'

  const { data, error } = await supabase.rpc('dashboard_top_places', {
    from_ts: from,
    to_ts: to,
    limit_n: 10,
    sort_by: sort,
  })

  if (error) {
    throw new Error(`Failed to load top places: ${error.message}`)
  }

  return apiSuccess(data ?? [])
})
