'use client'

import { Plus } from '@components/ui/icons'
import {
  useDashboardMoM,
  useDashboardRecentPlaces,
  useDashboardSummary,
  useDashboardTopPlaces,
} from '@hooks/useDashboard'
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

export default function HomePage() {
  const { data: summary } = useDashboardSummary('last30')
  const { data: topPlaces = [] } = useDashboardTopPlaces('last30')
  const { data: recentPlaces = [] } = useDashboardRecentPlaces()
  const { data: mom } = useDashboardMoM()
  const recentPlace = recentPlaces[0]

  // most frequent area
  const mostFrequentArea = useMemo(() => {
    if (!topPlaces.length) return null
    return topPlaces[0]
  }, [topPlaces])

  // biggest leak (category) - to be added later when category API is available
  const biggestLeak = useMemo(() => {
    if (!mom?.top_place_name) return null
    return {
      name: mom.top_place_name,
      increase: mom.top_place_increase,
    }
  }, [mom])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-6 py-8 space-y-8">
        {/* Spend Summary */}
        <section className="text-center pt-6">
          <div className="text-6xl font-bold text-gray-900">
            {summary ? money(summary.total_spent) : '$0.00'}
          </div>
          <div className="text-sm text-gray-400 mt-3">last 30 days</div>
          {!summary && <div className="mt-3 text-sm text-gray-400">No spending data yet</div>}
        </section>

        {/* Insight */}
        <section className="space-y-2.5 px-2">
          {mostFrequentArea && (
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📍</span>
              <span className="text-sm text-gray-500">
                Most frequent area:{' '}
                <span className="font-semibold text-gray-900">{mostFrequentArea.place_name}</span>
              </span>
            </div>
          )}

          {biggestLeak && (
            <div className="flex items-center gap-2.5">
              <span className="text-xl">☕</span>
              <span className="text-sm text-gray-500">
                Biggest leak:{' '}
                <span className="font-semibold text-gray-900">{biggestLeak.name}</span>
              </span>
            </div>
          )}

          {!mostFrequentArea && !biggestLeak && (
            <div className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm text-gray-400">
              Insights will appear after you add a few receipts.
            </div>
          )}
        </section>

        {/* Scan/Upload Button */}
        <section className="flex flex-col items-center py-10">
          <Link
            href="/camera"
            className="relative w-28 h-28 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all active:scale-95 group"
          >
            <Plus className="w-8 h-8 text-gray-300 group-hover:text-gray-400 transition-colors" />
          </Link>
          <Link
            href="/upload"
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors inline-block"
          >
            or upload
          </Link>
        </section>

        {/* Map Preview - recent places */}
        <section>
          <div className="h-52 rounded-2xl overflow-hidden shadow-sm relative bg-white">
            {recentPlaces.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center bg-neutral-50">
                <div className="text-sm text-gray-400">No places yet</div>
                <div className="mt-1 text-xs text-gray-400">
                  Scan a receipt to see your spend map
                </div>
              </div>
            ) : (
              <>
                <MapPreview
                  zoom={12}
                  className="h-full"
                  showDefaultMarker={false}
                  location={
                    recentPlace
                      ? {
                          lat: recentPlace.lat,
                          lon: recentPlace.lon,
                          address: recentPlace.place_name,
                          displayName: recentPlace.place_name,
                        }
                      : null
                  }
                >
                  {recentPlace && (
                    <DynamicSpendMarker
                      key={recentPlace.place_id}
                      position={[recentPlace.lat, recentPlace.lon]}
                      amount={money(recentPlace.total)}
                      color="bg-blue-400"
                    />
                  )}
                </MapPreview>

                {/* Floating button on map */}
                <Link
                  href="/map"
                  className="absolute bottom-2 right-2 z-1000 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all group"
                >
                  <span className="text-sm font-medium text-gray-700">View spend map</span>
                  <span className="text-gray-400 group-hover:translate-x-1 transition-transform text-sm">
                    →
                  </span>
                </Link>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
