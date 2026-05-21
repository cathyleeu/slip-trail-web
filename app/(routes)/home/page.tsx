'use client'

import CategoryBarChart from '@components/dashboard/CategoryBarChart'
import { Avatar, Card } from '@components/ui'
import { Camera, Upload } from '@components/ui/icons'
import { useProfile } from '@hooks'
import {
  useDashboardCategoryBreakdown,
  useDashboardRecentPlaces,
  useDashboardSummary,
  useDashboardTopPlaces,
  useEmotionBreakdown,
} from '@hooks/useDashboard'
import { FEELING_EMOJIS } from '@lib/feelings'
import type { FeelingTag, Period } from '@types'
import { money } from '@utils'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const MapPreview = dynamic(() => import('@components/map'), {
  ssr: false,
  loading: () => <div className="h-full bg-zinc-100 animate-pulse rounded-2xl" />,
})

const DynamicSpendMarker = dynamic(() => import('@components/map/SpendMarker'), { ssr: false })

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'last7', label: '7 days' },
  { value: 'last30', label: '30 days' },
]

export default function HomePage() {
  const { profile } = useProfile()
  const [period, setPeriod] = useState<Period>('last7')
  const { data: summary } = useDashboardSummary(period)
  const { data: topPlaces = [] } = useDashboardTopPlaces(period)
  const { data: recentPlaces = [] } = useDashboardRecentPlaces()
  const { data: categoryBreakdown = [] } = useDashboardCategoryBreakdown(period)
  const { data: emotionBreakdown = [] } = useEmotionBreakdown(period)

  const mapCenter = recentPlaces[0] ?? topPlaces[0]
  const hasCategoryData = categoryBreakdown.some((item: { total: number }) => item.total > 0)

  const biggestLeak = useMemo(() => {
    if (!topPlaces.length) return null
    return { name: topPlaces[0].name, total: topPlaces[0].total }
  }, [topPlaces])

  const topEmotion = (emotionBreakdown as { feeling: string; count: number; total: number }[])[0] ?? null

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-0.5">
              {period === 'last7' ? 'This week' : 'This month'}
            </p>
            <h1 className="text-xl font-bold text-zinc-900">
              {profile?.name ? `${profile.name}'s trail` : 'Your trail'}
            </h1>
          </div>
          <Link href="/settings">
            <Avatar name={profile?.name} size="md" />
          </Link>
        </div>

        <div className="px-6 pb-32 space-y-4">
          {/* Spend Summary Card */}
          <Card className="relative px-7 py-6">
            {/* Segment control — period filter */}
            <div className="absolute top-4 right-4 flex bg-zinc-100 rounded-xl p-0.5 gap-0.5">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  className={`px-2.5 py-1 rounded-[10px] text-xs font-semibold transition-all ${
                    period === opt.value
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="text-6xl font-black text-zinc-900 tracking-tighter tabular-nums leading-none">
              {summary ? money(summary.total) : '$0.00'}
            </div>
            {summary ? (
              <div className="mt-2.5 text-sm text-zinc-400">
                <span className="font-bold text-zinc-700">{summary.receipt_count}</span>{' '}
                {summary.receipt_count === 1 ? 'receipt' : 'receipts'} captured
              </div>
            ) : (
              <div className="mt-2.5 text-sm text-zinc-400">No spending yet</div>
            )}
          </Card>

          {/* Insight Card */}
          {biggestLeak ? (
            <Card className="px-5 py-4 bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💸</span>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-0.5">
                    Biggest leak
                  </p>
                  <p className="text-sm font-semibold text-zinc-900">{biggestLeak.name}</p>
                </div>
                <div className="ml-auto text-sm font-black text-zinc-900 tabular-nums">
                  {money(biggestLeak.total)}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="px-5 py-4">
              <p className="text-sm text-zinc-400">
                Your spending story starts with one receipt.
              </p>
            </Card>
          )}

          {/* Top Emotion */}
          {topEmotion && (
            <Link href="/insights">
              <Card className="px-5 py-4 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {FEELING_EMOJIS[topEmotion.feeling as FeelingTag] ?? '🏷️'}
                  </span>
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-0.5">
                      Top feeling
                    </p>
                    <p className="text-sm font-semibold text-zinc-900">
                      {topEmotion.feeling} · {topEmotion.count}×
                    </p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400">See insights →</span>
              </Card>
            </Link>
          )}

          {/* Map Preview — Trail */}
          <Card className="h-64 overflow-hidden relative">
            {topPlaces.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center bg-zinc-50">
                <div className="text-3xl mb-2">🗺️</div>
                <div className="text-sm font-medium text-zinc-500">Your trail starts here</div>
                <div className="mt-1 text-xs text-zinc-400">
                  Scan a receipt to drop your first pin
                </div>
              </div>
            ) : (
              <>
                <MapPreview
                  zoom={12}
                  className="h-full"
                  showDefaultMarker={false}
                  location={
                    mapCenter
                      ? {
                          lat: mapCenter.lat,
                          lon: mapCenter.lon,
                          address: mapCenter.name,
                          displayName: mapCenter.name,
                        }
                      : null
                  }
                >
                  {topPlaces.map((place: { place_id: string; lat: number; lon: number; total: string; category?: string }) => (
                    <DynamicSpendMarker
                      key={place.place_id}
                      position={[place.lat, place.lon]}
                      amount={money(place.total)}
                      category={place.category}
                    />
                  ))}
                </MapPreview>

                <Link
                  href="/map"
                  className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-sm shadow-md text-xs font-semibold text-zinc-700 hover:shadow-lg transition-all"
                >
                  View trail →
                </Link>
              </>
            )}
          </Card>

          {/* Category Breakdown */}
          <Card className="p-5">
            {hasCategoryData ? (
              <CategoryBarChart items={categoryBreakdown} />
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-center">
                <div className="text-sm text-zinc-400">No category data yet</div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* CTA — fixed above bottom nav */}
      <div className="px-6 pb-4 pt-3 flex items-center gap-3 fixed bottom-[58px] left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[999]">
        <Link
          href="/camera"
          className="flex-1 flex items-center gap-4 bg-zinc-900 text-white rounded-2xl px-5 py-4 active:scale-[0.98] transition-all shadow-lg"
        >
          <Camera className="w-5 h-5 shrink-0 text-zinc-400" />
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-400 leading-tight">What did today cost you?</span>
            <span className="text-base font-semibold leading-tight">Scan receipt</span>
          </div>
        </Link>
        <Link
          href="/upload"
          className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-md active:scale-95 transition-all shrink-0 border border-zinc-100"
        >
          <Upload className="w-5 h-5 text-zinc-500" />
        </Link>
      </div>
    </div>
  )
}
