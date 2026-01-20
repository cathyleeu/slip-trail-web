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
