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

export const normalizeNumberInput = (raw: string) => {
  if (raw === '') return ''
  const value = raw.trim()
  if (value.startsWith('0') && value.length > 1 && value[1] !== '.') {
    const withoutLeading = value.replace(/^0+/, '')
    return withoutLeading === '' ? '0' : withoutLeading
  }
  return value
}

export function formatDateTime(v: string | Date | null | undefined) {
  if (!v) return '—'
  const d = typeof v === 'string' ? new Date(v) : v
  if (Number.isNaN(d.getTime())) return '—'
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} ${hh}:${min}:${ss}`
}
