import type { Period } from '@types'

// ============ Date Utilities ============

/**
 * Format date as YYYY-MM-DD (UTC)
 */
export function toYmd(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Format date as YYYY-MM (UTC)
 */
export function toYm(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/**
 * Get start of UTC day
 */
export function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0))
}

/**
 * Add days to a date (UTC)
 */
export function addUtcDays(d: Date, days: number): Date {
  const result = new Date(d)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

/**
 * Parse period from search params with default fallback
 */
export function parsePeriod(
  searchParams: URLSearchParams,
  defaultPeriod: Period = 'last30'
): Period {
  const p = searchParams.get('period')
  if (p === 'last7' || p === 'last30' || p === 'ytd') return p
  return defaultPeriod
}

// ============ Range Functions ============

/**
 * Get date range for a given period (returns ISO strings)
 * Compatible with existing API usage
 */
export function rangeFromPeriod(period: string) {
  const now = new Date()
  const to = now.toISOString()

  if (period === 'ytd') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0))
    return { from: start.toISOString(), to }
  }

  const days = period === 'last7' ? 7 : 30
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  return { from, to }
}

/**
 * Get date range with grain (day/month) for time-series data
 */
export function getRangeWithGrain(period: Period) {
  const now = new Date()
  const today0 = startOfUtcDay(now)

  if (period === 'last7') {
    const start = addUtcDays(today0, -6) // 오늘 포함 7일
    const endExclusive = addUtcDays(today0, 1)
    return { start, endExclusive, grain: 'day' as const }
  }

  if (period === 'last30') {
    const start = addUtcDays(today0, -29) // 오늘 포함 30일
    const endExclusive = addUtcDays(today0, 1)
    return { start, endExclusive, grain: 'day' as const }
  }

  // ytd
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0))
  const endExclusive = addUtcDays(today0, 1)
  return { start, endExclusive, grain: 'month' as const }
}
