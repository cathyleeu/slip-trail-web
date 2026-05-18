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
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const min = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} ${hh}:${min}:${ss}`
}

export function formatRelativeTime(v: string | Date | null | undefined): string {
  if (!v) return '—'
  const d = typeof v === 'string' ? new Date(v) : v
  if (Number.isNaN(d.getTime())) return '—'

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffDays === 0) return `Today · ${timeStr}`
  if (diffDays === 1) return `Yesterday · ${timeStr}`
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' }) + ` · ${timeStr}`
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
