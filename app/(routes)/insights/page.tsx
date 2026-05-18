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

const SESSION_LABELS: Record<string, string> = {
  Morning: '🌅 Morning',
  Afternoon: '☀️ Afternoon',
  Evening: '🌆 Evening',
  Night: '🌙 Night',
}

const SESSION_HOURS: Record<string, string> = {
  Morning: '6am – noon',
  Afternoon: 'noon – 6pm',
  Evening: '6pm – midnight',
  Night: 'midnight – 6am',
}

// Actual CSS color values for each feeling (used in bar fill)
const FEELING_COLORS: Record<FeelingTag, string> = {
  Necessary: '#22c55e',  // green-500
  Impulsive: '#f43f5e',  // rose-500
  Social: '#0ea5e9',     // sky-500
  Treat: '#8b5cf6',      // violet-500
  Routine: '#a1a1aa',    // zinc-400
  Stress: '#f97316',     // orange-500
  Celebration: '#f59e0b', // amber-500
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

  const heatmap = SESSIONS.map((session) => {
    const cells = (emotionByHour as EmotionCell[]).filter((c) => c.session === session)
    const max = Math.max(...cells.map((c) => c.count), 1)
    return { session, cells, max }
  })

  const togglePeriod = () => setPeriod(period === 'last7' ? 'last30' : 'last7')

  const topFeelingColor = topEmotion
    ? FEELING_COLORS[topEmotion.feeling as FeelingTag] ?? '#6366f1'
    : '#6366f1'

  return (
    <div className="min-h-screen bg-zinc-50 pb-28">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-0.5">
            {period === 'last7' ? 'This week' : 'This month'}
          </p>
          <h1 className="text-2xl font-extrabold text-zinc-900">Insights</h1>
        </div>
        <button
          onClick={togglePeriod}
          className="px-3.5 py-1.5 bg-white rounded-full text-xs font-semibold text-zinc-600 shadow-sm border border-zinc-100 active:scale-95 transition-all"
        >
          {period === 'last7' ? 'Month' : 'Week'}
        </button>
      </div>

      <div className="px-6 space-y-4">
        {/* Top emotion hero card */}
        {topEmotion ? (
          <Card
            className="px-6 py-6 overflow-hidden relative"
            style={{ backgroundColor: topFeelingColor + '12' }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-8 -mt-8 opacity-10"
              style={{ backgroundColor: topFeelingColor }}
            />
            <p className="text-xs font-semibold tracking-widest uppercase mb-3"
               style={{ color: topFeelingColor }}>
              Most felt · {period === 'last7' ? 'this week' : 'this month'}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-5xl">
                {FEELING_EMOJIS[topEmotion.feeling as FeelingTag] ?? '💸'}
              </span>
              <div>
                <div className="text-3xl font-black text-zinc-900 leading-tight">
                  {topEmotion.feeling}
                </div>
                <div className="text-sm text-zinc-500 mt-0.5">
                  {topEmotion.count}× · {money(topEmotion.total)}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="px-6 py-6">
            <div className="text-3xl mb-2">🏷️</div>
            <p className="text-sm font-medium text-zinc-700">No feelings tagged yet.</p>
            <p className="text-xs text-zinc-400 mt-1">
              After scanning a receipt, tag how it made you feel.
            </p>
          </Card>
        )}

        {/* Emotion breakdown */}
        {(emotionBreakdown as EmotionSlice[]).length > 0 && (
          <Card className="px-5 py-5 space-y-4">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Emotion breakdown
            </p>
            <div className="space-y-4">
              {(emotionBreakdown as EmotionSlice[]).map((e) => {
                const widthPct = totalSpend > 0 ? (e.total / totalSpend) * 100 : 0
                const color = FEELING_COLORS[e.feeling as FeelingTag] ?? '#6366f1'
                return (
                  <div key={e.feeling}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{FEELING_EMOJIS[e.feeling as FeelingTag]}</span>
                        <span className="text-sm font-medium text-zinc-800">{e.feeling}</span>
                        <span className="text-xs text-zinc-400">×{e.count}</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-900 tabular-nums">
                        {money(e.total)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Time of day heatmap */}
        {(emotionByHour as EmotionCell[]).length > 0 && (
          <Card className="px-5 py-5 space-y-4">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              When do you spend?
            </p>
            <div className="space-y-4">
              {heatmap.map(({ session, cells, max }) => {
                if (cells.length === 0) return null
                const totalInSession = cells.reduce((s: number, c: EmotionCell) => s + c.count, 0)
                const sortedCells = [...cells].sort((a: EmotionCell, b: EmotionCell) => b.count - a.count)
                return (
                  <div key={session}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold text-zinc-700">
                          {SESSION_LABELS[session]}
                        </span>
                        <span className="text-xs text-zinc-400 ml-1.5">{SESSION_HOURS[session]}</span>
                      </div>
                      <span className="text-xs text-zinc-400">{totalInSession}×</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {sortedCells.map((cell: EmotionCell) => {
                        const opacity = Math.max(0.25, cell.count / max)
                        const color = FEELING_COLORS[cell.feeling as FeelingTag] ?? '#6366f1'
                        return (
                          <div
                            key={cell.feeling}
                            className="flex items-center gap-1 rounded-full px-2.5 py-1"
                            style={{ backgroundColor: color + Math.round(opacity * 255).toString(16).padStart(2, '0') }}
                          >
                            <span className="text-xs">
                              {FEELING_EMOJIS[cell.feeling as FeelingTag]}
                            </span>
                            <span className="text-xs font-semibold text-white">{cell.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {totalCount > 0 && (
          <p className="text-center text-xs text-zinc-400 pb-2">
            Based on {totalCount} tagged {totalCount === 1 ? 'receipt' : 'receipts'}
          </p>
        )}
      </div>
    </div>
  )
}
