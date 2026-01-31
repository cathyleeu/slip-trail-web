export function money(v: string | number | null | undefined, currency = 'CAD') {
  const n = typeof v === 'string' ? Number(v) : v ?? 0
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(n)
}

export function pct(v: string | number | null | undefined) {
  if (v === null || v === undefined) return '—'
  const n = typeof v === 'string' ? Number(v) : v
  if (Number.isNaN(n)) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

export function isoRange(period: 'day' | 'week' | 'month') {
  const now = new Date()
  const to = new Date(now)
  const from = new Date(now)

  if (period === 'day') from.setDate(from.getDate() - 1)
  if (period === 'week') from.setDate(from.getDate() - 7)
  if (period === 'month') from.setMonth(from.getMonth() - 1)

  return { from_ts: from.toISOString(), to_ts: to.toISOString() }
}
