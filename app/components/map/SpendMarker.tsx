'use client'

import { getCategoryEmoji } from '@lib/categories'
import L from 'leaflet'
import { useMemo } from 'react'
import { renderToString } from 'react-dom/server'
import { Marker } from 'react-leaflet'

type SpendMarkerProps = {
  position: [number, number]
  amount: string
  category?: string
}

export default function SpendMarker({ position, amount, category }: SpendMarkerProps) {
  const icon = useMemo(() => {
    const emoji = getCategoryEmoji(category)

    const html = renderToString(
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'white',
          color: '#374151',
          padding: '6px 10px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          whiteSpace: 'nowrap',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <span style={{ fontSize: '14px' }}>{emoji}</span>
        <span>{amount}</span>
      </div>
    )

    return L.divIcon({
      html,
      className: 'spend-marker', // remove leaflet default styles
      iconSize: [80, 32], // adjusted size for icon + amount
      iconAnchor: [40, 16], // center alignment
    })
  }, [amount, category])

  return <Marker position={position} icon={icon} />
}
