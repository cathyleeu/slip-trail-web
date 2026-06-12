import { withAuth } from '@lib/apiHandler'
import { apiError, apiSuccess } from '@lib/apiResponse'
import { ERROR_MESSAGES } from '@lib/constants'
import { parsePeriod, rangeFromPeriod } from '@utils/range'

const VALID_BUCKETS = ['day', 'week', 'month'] as const

export const GET = withAuth(async (req, { supabase }) => {
  const url = new URL(req.url)
  const period = parsePeriod(url.searchParams)
  const bucket = url.searchParams.get('bucket') ?? 'day'

  if (!VALID_BUCKETS.includes(bucket as (typeof VALID_BUCKETS)[number])) {
    return apiError('Invalid bucket', {
      status: 400,
      details: `bucket must be one of: ${VALID_BUCKETS.join(', ')}`,
    })
  }

  const { from, to } = rangeFromPeriod(period)

  const { data, error } = await supabase.rpc('dashboard_timeseries', {
    from_ts: from,
    to_ts: to,
    bucket,
  })

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_LOAD_TIMESERIES}: ${error.message}`)
  }

  return apiSuccess(data ?? [])
})
