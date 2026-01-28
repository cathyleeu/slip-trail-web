import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { parsePeriod, rangeFromPeriod } from '@utils/range'

export const GET = withAuth(async (req, { supabase }) => {
  const url = new URL(req.url)
  const period = parsePeriod(url.searchParams)
  const bucket = url.searchParams.get('bucket') ?? 'day'
  const { from, to } = rangeFromPeriod(period)

  const { data, error } = await supabase.rpc('dashboard_timeseries', {
    from_ts: from,
    to_ts: to,
    bucket,
  })

  if (error) {
    throw new Error(`Failed to load timeseries: ${error.message}`)
  }

  return apiSuccess(data ?? [])
})
