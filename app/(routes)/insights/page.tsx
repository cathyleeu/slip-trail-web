'use client'

import { Card, SegmentToggle } from '@components/ui'
import { useEmotionBreakdown, useEmotionByHour } from '@hooks/useDashboard'
import { FEELING_EMOJIS, FEELING_HEX_COLORS } from '@lib/feelings'
import type { FeelingTag, Period } from '@types'
import { money } from '@utils'
import { motion } from 'motion/react'
import { useState } from 'react'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
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

type EmotionSlice = { feeling: string; count: number; total: number }
type EmotionCell = { session: string; feeling: string; count: number }

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>('last7')
  const { data: emotionBreakdown = [], isError: breakdownError } = useEmotionBreakdown(period)
  const { data: emotionByHour = [], isError: byHourError } = useEmotionByHour(period)
  const isError = breakdownError || byHourError

  const breakdown = emotionBreakdown as EmotionSlice[]
  const byHour = emotionByHour as EmotionCell[]

  const totalSpend = breakdown.reduce((sum, e) => sum + e.total, 0)
  const totalCount = breakdown.reduce((sum, e) => sum + e.count, 0)
  const topEmotion = breakdown[0] ?? null
  const topFeelingColor = topEmotion
    ? (FEELING_HEX_COLORS[topEmotion.feeling as FeelingTag] ?? '#6366f1')
    : '#6366f1'

  const heatmap = SESSIONS.map((session) => {
    const cells = byHour.filter((c) => c.session === session)
    const max = Math.max(...cells.map((c) => c.count), 1)
    return { session, cells, max }
  })

  if (isError) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm font-medium text-zinc-700">Couldn&apos;t load your insights.</p>
          <p className="text-xs text-zinc-400 mt-1">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-28">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-0.5">
            Spending patterns
          </p>
          <h1 className="text-2xl font-extrabold text-zinc-900">Insights</h1>
        </div>

        {/* Segment control — consistent with Map page */}
        <SegmentToggle
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
          className="bg-surface rounded-2xl shadow-sm border border-border gap-0.5"
          optionClassName="px-3 py-1.5 rounded-xl"
        />
      </div>

      <div className="px-6 space-y-4">
        {/* Top emotion hero card */}
        {topEmotion ? (
          <Card
            className="px-6 py-6 overflow-hidden relative"
            style={{ backgroundColor: topFeelingColor + '14' }}
          >
            {/* Decorative circle */}
            <div
              className="absolute top-0 right-0 w-36 h-36 rounded-full -mr-10 -mt-10 opacity-10"
              style={{ backgroundColor: topFeelingColor }}
            />

            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: topFeelingColor }}
            >
              Most felt · {period === 'last7' ? 'this week' : 'this month'}
            </p>

            <div className="flex items-center gap-4">
              <span className="text-5xl">{FEELING_EMOJIS[topEmotion.feeling as FeelingTag] ?? '💸'}</span>
              <div>
                <div className="text-3xl font-black text-zinc-900 leading-tight">{topEmotion.feeling}</div>
                <div className="text-sm text-zinc-500 mt-0.5">
                  {topEmotion.count}× — {money(topEmotion.total)}
                </div>
              </div>
            </div>

            {totalSpend > 0 && (
              <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Total tagged</span>
                <span className="text-sm font-bold text-zinc-900 tabular-nums">
                  {money(totalSpend)} · {totalCount} receipts
                </span>
              </div>
            )}
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
        {breakdown.length > 0 && (
          <Card className="px-5 py-5 space-y-4">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Emotion breakdown
            </p>
            <div className="space-y-4">
              {breakdown.map((e, i) => {
                const widthPct = totalSpend > 0 ? (e.total / totalSpend) * 100 : 0
                const color = FEELING_HEX_COLORS[e.feeling as FeelingTag] ?? '#6366f1'
                return (
                  <motion.div
                    key={e.feeling}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
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
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ delay: i * 0.06 + 0.15, duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Time of day heatmap */}
        {byHour.length > 0 && (
          <Card className="px-5 py-5 space-y-4">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              When do you spend?
            </p>
            <div className="space-y-4">
              {heatmap.map(({ session, cells, max }) => {
                if (cells.length === 0) return null
                const totalInSession = cells.reduce((s, c) => s + c.count, 0)
                const sortedCells = [...cells].sort((a, b) => b.count - a.count)
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
                      {sortedCells.map((cell) => {
                        const opacity = Math.max(0.25, cell.count / max)
                        const color = FEELING_HEX_COLORS[cell.feeling as FeelingTag] ?? '#6366f1'
                        const alphaByte = Math.round(opacity * 255).toString(16).padStart(2, '0')
                        return (
                          <div
                            key={cell.feeling}
                            className="flex items-center gap-1 rounded-full px-2.5 py-1"
                            style={{ backgroundColor: color + alphaByte }}
                          >
                            <span className="text-xs">{FEELING_EMOJIS[cell.feeling as FeelingTag]}</span>
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
