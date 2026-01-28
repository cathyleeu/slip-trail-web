import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { DEFAULT_CURRENCY } from '@lib/constants'
import type { Period, SeriesPoint, SpendSeriesResponse } from '@types'
import { addUtcDays, getRangeWithGrain, parsePeriod, toYm, toYmd } from '@utils/range'

function buildBuckets(period: Period, start: Date, endExclusive: Date) {
  // points를 "연속된 버킷"으로 만들기 (빈날도 0으로)
  const points: SeriesPoint[] = []

  if (period === 'ytd') {
    // 월 단위
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
    while (cursor < endExclusive) {
      points.push({ label: toYm(cursor), total: 0 })
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    }
    return points
  }

  // day 단위
  let cursor = new Date(start)
  while (cursor < endExclusive) {
    points.push({ label: toYmd(cursor), total: 0 })
    cursor = addUtcDays(cursor, 1)
  }
  return points
}

export const GET = withAuth(async (req, { user, supabase }) => {
  const url = new URL(req.url)
  const period = parsePeriod(url.searchParams)
  const { start, endExclusive, grain } = getRangeWithGrain(period)

  // 1) 범위 내 receipt 가져오기 (포폴용: 서버에서 집계)
  const { data, error } = await supabase
    .from('receipts')
    .select('purchased_at, created_at, total')
    .eq('user_id', user.id)
    .gte('purchased_at', start.toISOString())
    .lt('purchased_at', endExclusive.toISOString())
    .order('purchased_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to load spend series: ${error.message}`)
  }

  const buckets = buildBuckets(period, start, endExclusive)
  const bucketIndex = new Map<string, number>()
  buckets.forEach((b, i) => bucketIndex.set(b.label, i))

  // 2) 집계
  for (const row of data ?? []) {
    // purchased_at이 null인 데이터가 있다면 created_at으로 fallback (선택)
    const dtRaw = row.purchased_at ?? row.created_at
    if (!dtRaw) continue

    const dt = new Date(dtRaw)
    const key = grain === 'month' ? toYm(dt) : toYmd(dt)

    const idx = bucketIndex.get(key)
    if (idx === undefined) continue

    const v = typeof row.total === 'number' ? row.total : Number(row.total ?? 0)
    buckets[idx].total += Number.isFinite(v) ? v : 0
  }

  const payload: SpendSeriesResponse = {
    points: buckets.map((b) => ({
      label: b.label,
      total: Math.round(b.total * 100) / 100,
    })),
    currency: DEFAULT_CURRENCY,
  }

  return apiSuccess(payload)
})
