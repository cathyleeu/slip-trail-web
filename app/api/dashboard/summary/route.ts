import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { ERROR_MESSAGES } from '@lib/constants'
import type { SummaryRow } from '@types'
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
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_LOAD_SUMMARY}: ${error.message}`)
  }

  return apiSuccess<SummaryRow | null>(data?.[0] ?? null)
})
