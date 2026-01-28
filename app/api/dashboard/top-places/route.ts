import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { TOP_PLACES_LIMIT } from '@lib/constants'
import { parsePeriod, rangeFromPeriod } from '@utils/range'

export const GET = withAuth(async (req, { supabase }) => {
  const url = new URL(req.url)
  const period = parsePeriod(url.searchParams)
  const { from, to } = rangeFromPeriod(period)
  const sort = url.searchParams.get('sort') ?? 'spend'

  const { data, error } = await supabase.rpc('dashboard_top_places', {
    from_ts: from,
    to_ts: to,
    limit_n: TOP_PLACES_LIMIT,
    sort_by: sort,
  })

  if (error) {
    throw new Error(`Failed to load top places: ${error.message}`)
  }

  return apiSuccess(data ?? [])
})
