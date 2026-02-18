import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { ERROR_MESSAGES } from '@lib/constants'
import { parsePeriod, rangeFromPeriod } from '@utils/range'

type CategorySlice = {
  category: string
  total: number
}

type ReceiptRow = {
  total: number | null
  subtotal: number | null
  place?: { category?: string | null } | null
}

export const GET = withAuth(async (req, { user, supabase }) => {
  const url = new URL(req.url)
  const period = parsePeriod(url.searchParams)
  const { from, to } = rangeFromPeriod(period)

  const { data, error } = await supabase
    .from('receipts')
    .select('total, subtotal, place:places(category)')
    .eq('user_id', user.id)
    .or(
      `and(purchased_at.gte.${from},purchased_at.lt.${to}),and(purchased_at.is.null,created_at.gte.${from},created_at.lt.${to})`
    )

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_LOAD_CATEGORY_BREAKDOWN}: ${error.message}`)
  }

  const totals = new Map<string, number>()

  for (const row of (data ?? []) as ReceiptRow[]) {
    const amount = Number(row.total ?? row.subtotal ?? 0)
    if (!amount || Number.isNaN(amount)) continue

    const category = row.place?.category?.trim() || 'Uncategorized'
    totals.set(category, (totals.get(category) ?? 0) + amount)
  }

  const result: CategorySlice[] = Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  return apiSuccess<CategorySlice[]>(result)
})
