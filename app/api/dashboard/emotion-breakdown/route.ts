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
    .select('feeling, total')
    .eq('user_id', user.id)
    .not('feeling', 'is', null)
    .gte('purchased_at', from)
    .lte('purchased_at', to)

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_FETCH_RECEIPTS}: ${error.message}`)
  }

  // Aggregate by feeling
  const map = new Map<string, { count: number; total: number }>()
  for (const row of data ?? []) {
    if (!row.feeling) continue
    const prev = map.get(row.feeling) ?? { count: 0, total: 0 }
    map.set(row.feeling, {
      count: prev.count + 1,
      total: prev.total + (row.total ?? 0),
    })
  }

  const result = Array.from(map.entries())
    .map(([feeling, { count, total }]) => ({ feeling, count, total }))
    .sort((a, b) => b.total - a.total)

  return apiSuccess(result)
})
