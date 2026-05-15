'use client'

import { Polyline } from 'react-leaflet'

type TrailPolylineProps = {
  positions: [number, number][]
}

export default function TrailPolyline({ positions }: TrailPolylineProps) {
  if (positions.length < 2) return null

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#6366f1',
        weight: 2.5,
        opacity: 0.6,
        dashArray: '6 8',
      }}
    />
  )
}
