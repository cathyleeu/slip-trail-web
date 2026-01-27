import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { supabaseServer } from '@lib/supabase/server'
import type { Period, SeriesPoint, SpendSeriesResponse } from '@types'
import { addUtcDays, getRangeWithGrain, parsePeriod, toYm, toYmd } from '@utils/range'

function buildBuckets(period: Period, start: Date, endExclusive: Date) {
  // points를 “연속된 버킷”으로 만들기 (빈날도 0으로)
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const period = parsePeriod(url.searchParams)
    const { start, endExclusive, grain } = getRangeWithGrain(period)

    const supabase = await supabaseServer()
    const auth = await requireAuth(supabase)
    if (!auth.ok) return auth.response

    // 1) 범위 내 receipt 가져오기 (포폴용: 서버에서 집계)
    const { data, error } = await supabase
      .from('receipts')
      .select('purchased_at, created_at, total')
      .eq('user_id', auth.user.id)
      .gte('purchased_at', start.toISOString())
      .lt('purchased_at', endExclusive.toISOString())
      .order('purchased_at', { ascending: true })

    if (error)
      return apiError('Failed to load spend series', { status: 500, details: error.message })

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

    // 3) (선택) label을 좀 더 보기 좋게 바꾸고 싶으면 여기서 변환 가능
    // 지금은 "YYYY-MM-DD" / "YYYY-MM" 그대로 둠 (UI에서 포맷팅 가능)

    const payload: SpendSeriesResponse = {
      points: buckets.map((b) => ({
        label: b.label,
        total: Math.round(b.total * 100) / 100,
      })),
      currency: 'CAD', // 필요하면 user profile / receipt currency로 바꿔도 됨
    }

    return apiSuccess(payload)
  } catch (e) {
    return apiError('Unexpected error', {
      status: 500,
      details: e instanceof Error ? e.message : String(e),
    })
  }
}
