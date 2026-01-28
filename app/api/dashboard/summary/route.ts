import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { parsePeriod, rangeFromPeriod } from '@utils/range'

export const GET = withAuth(async (req, { supabase }) => {
  const url = new URL(req.url)
  const period = parsePeriod(url.searchParams)
  const { from, to } = rangeFromPeriod(period)

  const { data, error } = await supabase.rpc('dashboard_summary', {
    from_ts: from,
    to_ts: to,
  })

  if (error) {
    throw new Error(`Failed to load summary: ${error.message}`)
  }

  return apiSuccess((data?.[0] ?? null) as unknown)
})
