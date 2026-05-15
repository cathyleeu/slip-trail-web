'use client'

import { IconButton, LocationPin, Spinner } from '@components/ui'
import { useMapReceipts } from '@hooks/useDashboard'
import { getFeelingEmoji } from '@lib/feelings'
import type { FeelingTag } from '@types'
import { money } from '@utils'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const Map = dynamic(() => import('@components/map'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-gray-100" />,
})

const DynamicSpendMarker = dynamic(() => import('@components/map/SpendMarker'), { ssr: false })
const DynamicTrailPolyline = dynamic(() => import('@components/map/TrailPolyline'), { ssr: false })

type Period = 'today' | 'last7' | 'last30'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: '7 days' },
  { value: 'last30', label: '30 days' },
]

function periodToQuery(period: Period): 'last7' | 'last30' {
  if (period === 'today') return 'last7'
  return period
}

type MapReceipt = {
  id: string
  vendor: string
  category: string | null
  total: number | null
  feeling: string | null
  purchased_at: string
  lat: number
  lon: number
  place_name: string | null
}

type SelectedReceipt = {
  id: string
  vendor: string
  total: number | null
  feeling: string | null
  purchased_at: string
  place_name: string | null
}

export default function MapPage() {
  const [period, setPeriod] = useState<Period>('last7')
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [selected, setSelected] = useState<SelectedReceipt | null>(null)

  const { data: receipts = [] } = useMapReceipts(periodToQuery(period))

  const filtered: MapReceipt[] =
    period === 'today'
      ? (receipts as MapReceipt[]).filter((r) => {
          const d = new Date(r.purchased_at)
          const today = new Date()
          return d.toDateString() === today.toDateString()
        })
      : (receipts as MapReceipt[])

  const trailPositions: [number, number][] = filtered.map((r) => [r.lat, r.lon])

  // Map center: first receipt or user location or Vancouver default
  const mapCenter =
    filtered.length > 0
      ? { lat: filtered[filtered.length - 1].lat, lon: filtered[filtered.length - 1].lon }
      : userLocation ?? { lat: 49.2827, lon: -123.1207 }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLocationLoading(false)
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="h-[calc(100vh-116px)] relative">
      {/* Period filter chips */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setPeriod(opt.value); setSelected(null) }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shadow transition-all ${
              period === opt.value
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Receipt count badge */}
      {filtered.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] bg-white rounded-full px-3 py-1.5 text-xs font-medium text-gray-500 shadow">
          {filtered.length} stops
        </div>
      )}

      {/* Current location button */}
      <IconButton
        onClick={getCurrentLocation}
        disabled={locationLoading}
        className="absolute bottom-20 right-4 z-[9999]"
        title="current location"
        variant="filled"
        size="md"
        shape="circle"
      >
        {locationLoading ? <Spinner /> : <LocationPin />}
      </IconButton>

      {/* Selected receipt popup */}
      {selected && (
        <div
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[9999] bg-white rounded-2xl shadow-xl px-5 py-4 w-72"
          onClick={() => setSelected(null)}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-gray-900 text-sm">{selected.vendor}</div>
              {selected.place_name && (
                <div className="text-xs text-gray-400 mt-0.5">{selected.place_name}</div>
              )}
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(selected.purchased_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-gray-900">{money(selected.total ?? 0)}</div>
              {selected.feeling && (
                <div className="text-xs text-gray-500 mt-1">
                  {getFeelingEmoji(selected.feeling as FeelingTag)} {selected.feeling}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-center text-gray-300">tap to dismiss</div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="absolute inset-x-0 bottom-24 z-[1000] flex justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 shadow text-sm text-gray-500">
            No receipts with location for this period
          </div>
        </div>
      )}

      <Map
        location={{ lat: mapCenter.lat, lon: mapCenter.lon, address: '' }}
        className="h-full"
        zoom={filtered.length > 0 ? 13 : 14}
        showDefaultMarker={false}
      >
        <DynamicTrailPolyline positions={trailPositions} />
        {filtered.map((r) => (
          <DynamicSpendMarker
            key={r.id}
            position={[r.lat, r.lon]}
            amount={money(r.total ?? 0)}
            category={r.category}
            feeling={r.feeling}
            onClick={() =>
              setSelected({
                id: r.id,
                vendor: r.vendor,
                total: r.total,
                feeling: r.feeling,
                purchased_at: r.purchased_at,
                place_name: r.place_name,
              })
            }
          />
        ))}
      </Map>
    </div>
  )
}
