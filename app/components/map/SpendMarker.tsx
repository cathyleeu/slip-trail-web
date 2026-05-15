'use client'

import { getCategoryEmoji } from '@lib/categories'
import { getFeelingEmoji } from '@lib/feelings'
import L from 'leaflet'
import { useMemo } from 'react'
import { renderToString } from 'react-dom/server'
import { Marker } from 'react-leaflet'

type SpendMarkerProps = {
  position: [number, number]
  amount: string
  category?: string | null
  feeling?: string | null
  onClick?: () => void
}

export default function SpendMarker({ position, amount, category, feeling, onClick }: SpendMarkerProps) {
  const icon = useMemo(() => {
    const emoji = getFeelingEmoji(feeling) ?? getCategoryEmoji(category)

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
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '14px' }}>{emoji}</span>
        <span>{amount}</span>
      </div>
    )

    return L.divIcon({
      html,
      className: 'spend-marker',
      iconSize: [80, 32],
      iconAnchor: [40, 16],
    })
  }, [amount, category, feeling])

  return <Marker position={position} icon={icon} eventHandlers={onClick ? { click: onClick } : {}} />
}
