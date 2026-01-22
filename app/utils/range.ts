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
