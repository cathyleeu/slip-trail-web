'use client'

import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

type FitBoundsProps = {
  positions: [number, number][]
}

export default function FitBounds({ positions }: FitBoundsProps) {
  const map = useMap()
  const prevKey = useRef<string>('')

  useEffect(() => {
    if (positions.length === 0) return

    const key = positions.map((p) => p.join(',')).join('|')
    if (key === prevKey.current) return
    prevKey.current = key

    if (positions.length === 1) {
      map.setView(positions[0], 15, { animate: true, duration: 0.8 })
      return
    }

    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [80, 80], animate: true, maxZoom: 15 })
  }, [positions, map])

  return null
}
