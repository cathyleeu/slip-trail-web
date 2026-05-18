'use client'

import { toGeoLocation, toPlace } from '@lib/location'
import type { GeoLocation, NominatimResponse, Place } from '@types'
import { AnimatePresence, motion } from 'motion/react'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'

type SearchState = 'idle' | 'loading' | 'results' | 'no_results' | 'error'

type LocationResult = {
  location: GeoLocation
  place: Place
  displayName: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSelect: (location: GeoLocation, place: Place) => void
  initialQuery?: string
}

export function LocationSearch({ isOpen, onClose, onSelect, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [searchState, setSearchState] = useState<SearchState>('idle')
  const [results, setResults] = useState<LocationResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery)
      setSearchState('idle')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, initialQuery])

  const search = async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return

    setSearchState('loading')
    setResults([])

    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: trimmed, multiple: true }),
      })

      if (!res.ok) {
        setSearchState('no_results')
        return
      }

      const json = await res.json()
      const raw: NominatimResponse[] = json.data ?? []

      if (raw.length === 0) {
        setSearchState('no_results')
        return
      }

      setResults(
        raw.map((r) => ({
          location: toGeoLocation(r),
          place: toPlace(r),
          displayName: r.display_name,
        }))
      )
      setSearchState('results')
    } catch {
      setSearchState('error')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') search(query)
  }

  const handleSelect = (r: LocationResult) => {
    onSelect(r.location, r.place)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm"
          />

          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[1101] bg-white rounded-t-3xl shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 bg-zinc-200 rounded-full" />
            </div>

            <div className="px-5 pt-3 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
                    Location
                  </p>
                  <h2 className="text-lg font-extrabold text-zinc-900 leading-tight">
                    Search address
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Search bar */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Store name, address, or city..."
                    className="w-full pl-9 pr-4 py-3 bg-zinc-100 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </div>
                <button
                  onClick={() => search(query)}
                  disabled={searchState === 'loading' || !query.trim()}
                  className="px-4 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-xl disabled:opacity-40 active:scale-95 transition-all"
                >
                  Search
                </button>
              </div>

              {/* State: loading */}
              {searchState === 'loading' && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-zinc-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {/* State: results */}
              {searchState === 'results' && (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {results.map((r, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSelect(r)}
                      className="w-full text-left px-4 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors active:scale-[0.98]"
                    >
                      <p className="text-sm font-semibold text-zinc-900 line-clamp-1">
                        {r.place.name || r.place.address.split(',')[0]}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{r.displayName}</p>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* State: no_results */}
              {searchState === 'no_results' && (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm font-semibold text-zinc-700">No results found</p>
                  <p className="text-xs text-zinc-400 mt-1">Try a different address or store name</p>
                </div>
              )}

              {/* State: error */}
              {searchState === 'error' && (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-2">⚠️</div>
                  <p className="text-sm font-semibold text-zinc-700">Search failed</p>
                  <p className="text-xs text-zinc-400 mt-1">Check your connection and try again</p>
                </div>
              )}

              {/* State: idle */}
              {searchState === 'idle' && (
                <p className="text-xs text-zinc-400 text-center py-4">
                  Type an address or store name and tap Search
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
