'use client'

import { IconButton, LocationPin, Spinner } from '@components/ui'
import { useMapReceipts } from '@hooks/useDashboard'
import { getFeelingEmoji } from '@lib/feelings'
import type { FeelingTag } from '@types'
import { money } from '@utils'
import { AnimatePresence, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const Map = dynamic(() => import('@components/map'), {
  ssr: false,
  loading: () => <div className="h-full bg-zinc-100" />,
})

const DynamicSpendMarker = dynamic(() => import('@components/map/SpendMarker'), { ssr: false })
const DynamicTrailPolyline = dynamic(() => import('@components/map/TrailPolyline'), { ssr: false })
const DynamicFitBounds = dynamic(() => import('@components/map/FitBounds'), { ssr: false })

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
  img_url: string | null
}

type SelectedReceipt = {
  id: string
  vendor: string
  total: number | null
  feeling: string | null
  purchased_at: string
  place_name: string | null
  img_url: string | null
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

  // When there are no receipts, default to user location or Vancouver
  const fallbackCenter = userLocation ?? { lat: 49.2827, lon: -123.1207 }

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
      {/* Segment control — period filter */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="flex bg-white rounded-2xl shadow-md p-1 gap-0.5 border border-zinc-100">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setPeriod(opt.value); setSelected(null) }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === opt.value
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stops badge */}
      {filtered.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] bg-white rounded-full px-3 py-1.5 shadow border border-zinc-100 flex items-center gap-1.5">
          <span className="text-xs">📍</span>
          <span className="text-xs font-semibold text-zinc-700">{filtered.length} stops</span>
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

      {/* Bottom sheet popup for selected receipt */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[9998]"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ y: 140, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 140, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="absolute bottom-4 left-4 right-4 z-[9999] bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden"
            >
              {/* Handle */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-8 h-1 bg-zinc-200 rounded-full" />
              </div>

              {/* Thumbnail */}
              {selected.img_url && (
                <div className="relative mx-4 h-32 rounded-2xl overflow-hidden mb-3">
                  <Image
                    src={selected.img_url}
                    alt={selected.vendor}
                    fill
                    className="object-cover"
                    sizes="(max-width: 430px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}

              <div className="px-5 pb-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-zinc-900 text-base truncate">{selected.vendor}</div>
                    {selected.place_name && (
                      <div className="text-xs text-zinc-400 mt-0.5 truncate">📍 {selected.place_name}</div>
                    )}
                    <div className="text-xs text-zinc-400 mt-1">
                      {new Date(selected.purchased_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-zinc-900 tabular-nums">
                      {money(selected.total ?? 0)}
                    </div>
                    {selected.feeling && (
                      <div className="text-xs text-zinc-500 mt-1">
                        {getFeelingEmoji(selected.feeling as FeelingTag)} {selected.feeling}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition-colors"
                  >
                    Dismiss
                  </button>
                  <Link
                    href={`/receipts/${selected.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-xs font-semibold text-white text-center hover:bg-zinc-800 transition-colors"
                  >
                    View receipt
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="absolute inset-x-0 bottom-24 z-[1000] flex justify-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow border border-zinc-100 text-xs font-medium text-zinc-500">
            No receipts with location for this period
          </div>
        </div>
      )}

      <Map
        location={filtered.length === 0 ? { lat: fallbackCenter.lat, lon: fallbackCenter.lon, address: '' } : null}
        className="h-full"
        zoom={14}
        showDefaultMarker={false}
        disableAutoCenter={filtered.length > 0}
      >
        <DynamicFitBounds positions={trailPositions} />
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
                img_url: r.img_url,
              })
            }
          />
        ))}
      </Map>
    </div>
  )
}
