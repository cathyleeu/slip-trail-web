'use client'

import CategoryBarChart from '@components/dashboard/CategoryBarChart'
import { Avatar, Button, Card } from '@components/ui'
import { Camera, Upload } from '@components/ui/icons'
import { useProfile, useTab } from '@hooks'
import {
  useDashboardCategoryBreakdown,
  useDashboardRecentPlaces,
  useDashboardSummary,
  useDashboardTopPlaces,
} from '@hooks/useDashboard'
import type { Period } from '@types'
import { money } from '@utils'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo } from 'react'

// client-side dynamic import for map and marker - to avoid SSR issues with Leaflet and to reduce initial bundle size
const MapPreview = dynamic(() => import('@components/map'), {
  ssr: false,
  loading: () => <div className="h-full bg-neutral-100 animate-pulse rounded-2xl" />,
})

const DynamicSpendMarker = dynamic(() => import('@components/map/SpendMarker'), { ssr: false })

const PERIOD_TABS: { value: Period; label: string }[] = [
  { value: 'last7', label: '7 days' },
  { value: 'last30', label: '30 days' },
]

export default function HomePage() {
  const { profile } = useProfile()
  const { value: period, setValue: setPeriod } = useTab<Period>(PERIOD_TABS, 'last7')
  const { data: summary } = useDashboardSummary(period)
  const { data: topPlaces = [] } = useDashboardTopPlaces(period)
  const { data: recentPlaces = [] } = useDashboardRecentPlaces()
  const { data: categoryBreakdown = [] } = useDashboardCategoryBreakdown(period)

  // 지도 중심점: 가장 최근 방문한 장소
  const mapCenter = recentPlaces[0] ?? topPlaces[0]
  const hasCategoryData = categoryBreakdown.some((item) => item.total > 0)

  // most frequent area
  // const mostFrequentArea = useMemo(() => {
  //   if (!topPlaces.length) return null
  //   return topPlaces[0]
  // }, [topPlaces])

  const biggestLeak = useMemo(() => {
    if (!topPlaces.length) return null
    return {
      name: topPlaces[0].name,
      total: topPlaces[0].total,
    }
  }, [topPlaces])

  const togglePeriod = () => setPeriod(period === 'last7' ? 'last30' : 'last7')

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        {/* Header with user name and avatar */}
        <div className="px-6 pt-8 pb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.name ? `${profile.name}'s snapshots` : 'Your snapshots'}
          </h1>
          <Link href="/settings">
            <Avatar name={profile?.name} size="md" />
          </Link>
        </div>

        <div className="px-6 pb-28 space-y-8">
          {/* Spend Summary Card */}
          <Card className="relative px-7 py-7">
            {/* Period toggle chip */}
            <Button
              onClick={togglePeriod}
              className="absolute top-5 right-5 px-4 py-1.5 bg-white hover:bg-transparent text-sm font-medium text-gray-600 active:scale-95 transition-all shadow-sm"
            >
              {period === 'last7' ? 'Month' : 'Week'}
            </Button>

            <div className="text-sm text-gray-400 mb-2">
              {period === 'last7' ? 'This week' : 'This month'}
            </div>
            <div className="text-5xl font-bold text-gray-900 tracking-tight">
              {summary ? money(summary.total) : '$0.00'}
            </div>
            {summary ? (
              <div className="mt-3 text-base text-gray-500">
                <span className="font-semibold text-gray-900">{summary.receipt_count}</span>{' '}
                receipts
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-400">No spending data yet</div>
            )}
          </Card>

          {/* Insight */}
          <Card className="space-y-2 px-2">
            {/* {mostFrequentArea && (
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📍</span>
                <span className="text-sm text-gray-500">
                  Most frequent area:{' '}
                  <span className="font-semibold text-gray-900">{mostFrequentArea.name}</span>
                </span>
              </div>
            )} */}

            {biggestLeak && (
              <div className="flex items-center gap-2.5">
                <span className="text-xl">☕</span>
                <span className="text-sm text-gray-500">
                  Biggest leak:{' '}
                  <span className="font-semibold text-gray-900">{biggestLeak.name}</span>
                </span>
              </div>
            )}

            {!biggestLeak && (
              <p className="px-4 py-3 text-sm text-gray-400">
                Your spending story starts with one receipt.
              </p>
            )}
          </Card>

          {/* Category Breakdown */}
          <Card className="p-5">
            {hasCategoryData ? (
              <CategoryBarChart items={categoryBreakdown} />
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <div className="text-sm text-gray-400">No category data yet</div>
                <div className="mt-1 text-xs text-gray-400">
                  Add receipts to see your spending breakdown
                </div>
              </div>
            )}
          </Card>

          {/* Map Preview - top places by period */}
          <Card className="h-52 overflow-hidden relative">
            {topPlaces.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center bg-neutral-50">
                <div className="text-sm text-gray-400">No places yet</div>
                <div className="mt-1 text-xs text-gray-400">
                  Scan a receipt to see your spend journey
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
                  {topPlaces.map((place) => (
                    <DynamicSpendMarker
                      key={place.place_id}
                      position={[place.lat, place.lon]}
                      amount={money(place.total)}
                      category={place.category}
                    />
                  ))}
                </MapPreview>

                {/* Floating button on map */}
                <Link
                  href="/receipts"
                  className="absolute bottom-2 right-2 z-1000 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all group"
                >
                  <span className="text-sm font-medium text-gray-700">View spend journey</span>
                  <span className="text-gray-400 group-hover:translate-x-1 transition-transform text-sm">
                    →
                  </span>
                </Link>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* CTA — always pinned to bottom of viewport, centered within max-width */}
      <div className="px-6 pb-6 pt-3 flex items-center gap-3 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-1000">
        <Link
          href="/camera"
          className="flex-1 flex items-center gap-4 bg-gray-900 text-white rounded-2xl px-5 py-4 active:scale-[0.98] transition-all shadow-lg"
        >
          <Camera className="w-5 h-5 shrink-0 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 leading-tight">
              What did today cost you?
            </span>
            <span className="text-base font-semibold leading-tight">Scan receipt</span>
          </div>
        </Link>
        <Link
          href="/upload"
          className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-md active:scale-95 transition-all shrink-0"
        >
          <Upload className="w-5 h-5 text-gray-500" />
        </Link>
      </div>
    </div>
  )
}
