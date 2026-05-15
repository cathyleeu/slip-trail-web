import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { ERROR_MESSAGES } from '@lib/constants'
import { parsePeriod, rangeFromPeriod } from '@utils/range'

const SESSIONS = [
  { label: 'Morning', hours: [6, 7, 8, 9, 10, 11] },
  { label: 'Afternoon', hours: [12, 13, 14, 15, 16, 17] },
  { label: 'Evening', hours: [18, 19, 20, 21, 22, 23] },
  { label: 'Night', hours: [0, 1, 2, 3, 4, 5] },
]

export const GET = withAuth(async (req, { user, supabase }) => {
  const { searchParams } = new URL(req.url)
  const period = parsePeriod(searchParams, 'last30')
  const { from, to } = rangeFromPeriod(period)

  const { data, error } = await supabase
    .from('receipts')
    .select('feeling, purchased_at')
    .eq('user_id', user.id)
    .not('feeling', 'is', null)
    .not('purchased_at', 'is', null)
    .gte('purchased_at', from)
    .lte('purchased_at', to)

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_FETCH_RECEIPTS}: ${error.message}`)
  }

  // Group by session x feeling
  type Cell = { session: string; feeling: string; count: number }
  const cellMap = new Map<string, number>()

  for (const row of data ?? []) {
    if (!row.feeling || !row.purchased_at) continue
    const hour = new Date(row.purchased_at).getHours()
    const session = SESSIONS.find((s) => s.hours.includes(hour))?.label ?? 'Night'
    const key = `${session}::${row.feeling}`
    cellMap.set(key, (cellMap.get(key) ?? 0) + 1)
  }

  const result: Cell[] = []
  for (const [key, count] of cellMap.entries()) {
    const [session, feeling] = key.split('::')
    result.push({ session, feeling, count })
  }

  return apiSuccess(result)
})
