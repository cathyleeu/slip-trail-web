import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { ERROR_MESSAGES } from '@lib/constants'
import { parsePeriod, rangeFromPeriod } from '@utils/range'

export const GET = withAuth(async (req, { user, supabase }) => {
  const { searchParams } = new URL(req.url)
  const period = parsePeriod(searchParams, 'last30')
  const { from, to } = rangeFromPeriod(period)

  const { data, error } = await supabase
    .from('receipts')
    .select('id, vendor, category, total, feeling, purchased_at, lat, lon, place_name')
    .eq('user_id', user.id)
    .not('lat', 'is', null)
    .not('lon', 'is', null)
    .gte('purchased_at', from)
    .lte('purchased_at', to)
    .order('purchased_at', { ascending: true })

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_FETCH_RECEIPTS}: ${error.message}`)
  }

  return apiSuccess(data ?? [])
})
