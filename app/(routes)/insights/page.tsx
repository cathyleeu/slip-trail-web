'use client'

import { Card } from '@components/ui'
import { useEmotionBreakdown, useEmotionByHour } from '@hooks/useDashboard'
import { useTab } from '@hooks'
import { FEELING_EMOJIS, FEELING_STYLES } from '@lib/feelings'
import type { FeelingTag, Period } from '@types'
import { money } from '@utils'

const PERIOD_TABS: { value: Period; label: string }[] = [
  { value: 'last7', label: '7 days' },
  { value: 'last30', label: '30 days' },
]

const SESSIONS = ['Morning', 'Afternoon', 'Evening', 'Night']

const SESSION_HOURS: Record<string, string> = {
  Morning: '6am–12pm',
  Afternoon: '12–6pm',
  Evening: '6–12am',
  Night: '12–6am',
}

type EmotionSlice = { feeling: string; count: number; total: number }
type EmotionCell = { session: string; feeling: string; count: number }

export default function InsightsPage() {
  const { value: period, setValue: setPeriod } = useTab<Period>(PERIOD_TABS, 'last7')
  const { data: emotionBreakdown = [] } = useEmotionBreakdown(period)
  const { data: emotionByHour = [] } = useEmotionByHour(period)

  const totalSpend = (emotionBreakdown as EmotionSlice[]).reduce((sum, e) => sum + e.total, 0)
  const totalCount = (emotionBreakdown as EmotionSlice[]).reduce((sum, e) => sum + e.count, 0)
  const topEmotion = (emotionBreakdown as EmotionSlice[])[0] ?? null

  // Build session × feeling heatmap data
  const heatmap = SESSIONS.map((session) => {
    const cells = (emotionByHour as EmotionCell[]).filter((c) => c.session === session)
    const max = Math.max(...cells.map((c) => c.count), 1)
    return { session, cells, max }
  })

  const togglePeriod = () => setPeriod(period === 'last7' ? 'last30' : 'last7')

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <button
          onClick={togglePeriod}
          className="px-4 py-1.5 bg-white rounded-full text-sm font-medium text-gray-600 shadow-sm active:scale-95 transition-all"
        >
          {period === 'last7' ? 'Month' : 'Week'}
        </button>
      </div>

      <div className="px-6 space-y-6">
        {/* Top emotion summary */}
        {topEmotion ? (
          <Card className="px-6 py-5">
            <div className="text-sm text-gray-400 mb-1">
              {period === 'last7' ? 'This week' : 'This month'}, you mostly spent
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-4xl">
                {FEELING_EMOJIS[topEmotion.feeling as FeelingTag] ?? '💸'}
              </span>
              <div>
                <div className="text-2xl font-bold text-gray-900">{topEmotion.feeling}</div>
                <div className="text-sm text-gray-500">
                  {topEmotion.count} {topEmotion.count === 1 ? 'time' : 'times'} ·{' '}
                  {money(topEmotion.total)}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="px-6 py-5">
            <p className="text-sm text-gray-400">
              Tag your receipts with feelings to see emotional patterns here.
            </p>
          </Card>
        )}

        {/* Emotion breakdown bars */}
        {emotionBreakdown.length > 0 && (
          <Card className="px-5 py-5 space-y-4">
            <div className="text-base font-semibold text-gray-900">Emotion breakdown</div>
            <div className="space-y-3">
              {(emotionBreakdown as EmotionSlice[]).map((e) => {
                const style = FEELING_STYLES[e.feeling as FeelingTag]
                const widthPct = totalSpend > 0 ? (e.total / totalSpend) * 100 : 0
                return (
                  <div key={e.feeling}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>{FEELING_EMOJIS[e.feeling as FeelingTag]}</span>
                        <span>{e.feeling}</span>
                        <span className="text-gray-400 text-xs">×{e.count}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{money(e.total)}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: style
                            ? style.text.replace('text-', '').replace('-700', '')
                            : '#6366f1',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Time of day heatmap */}
        {emotionByHour.length > 0 && (
          <Card className="px-5 py-5 space-y-4">
            <div className="text-base font-semibold text-gray-900">When do you spend?</div>
            <div className="space-y-3">
              {heatmap.map(({ session, cells, max }) => {
                if (cells.length === 0) return null
                // Find dominant feeling for this session
                const topCell = cells.sort((a: EmotionCell, b: EmotionCell) => b.count - a.count)[0]
                const totalInSession = cells.reduce((s: number, c: EmotionCell) => s + c.count, 0)
                return (
                  <div key={session} className="flex items-center gap-3">
                    <div className="w-24 shrink-0">
                      <div className="text-xs font-medium text-gray-700">{session}</div>
                      <div className="text-xs text-gray-400">{SESSION_HOURS[session]}</div>
                    </div>
                    <div className="flex-1 flex gap-1 flex-wrap">
                      {cells.map((cell: EmotionCell) => {
                        const opacity = Math.max(0.2, cell.count / max)
                        const style = FEELING_STYLES[cell.feeling as FeelingTag]
                        return (
                          <div
                            key={cell.feeling}
                            className="flex items-center gap-1 rounded-full px-2.5 py-1"
                            style={{
                              backgroundColor: style
                                ? `rgba(99, 102, 241, ${opacity})`
                                : `rgba(107, 114, 128, ${opacity})`,
                            }}
                          >
                            <span className="text-xs">
                              {FEELING_EMOJIS[cell.feeling as FeelingTag]}
                            </span>
                            <span className="text-xs font-medium text-white">{cell.count}</span>
                          </div>
                        )
                      })}
                    </div>
                    {topCell && (
                      <div className="text-xs text-gray-400 shrink-0">{totalInSession}×</div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Total tagged receipts */}
        {totalCount > 0 && (
          <div className="text-center text-xs text-gray-400">
            Based on {totalCount} tagged {totalCount === 1 ? 'receipt' : 'receipts'}
          </div>
        )}
      </div>
    </div>
  )
}
