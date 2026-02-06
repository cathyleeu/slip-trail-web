'use client'

import L from 'leaflet'
import { useMemo } from 'react'
import { renderToString } from 'react-dom/server'
import { Marker } from 'react-leaflet'

type SpendMarkerProps = {
  position: [number, number]
  amount: string
  color?: string
}

export default function SpendMarker({ position, amount, color = 'bg-blue-400' }: SpendMarkerProps) {
  const icon = useMemo(() => {
    const html = renderToString(
      <div
        className={`${color}/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md whitespace-nowrap`}
      >
        {amount}
      </div>
    )

    return L.divIcon({
      html,
      className: 'spend-marker', // remove leaflet default styles
      iconSize: [60, 30], // estimated size
      iconAnchor: [30, 15], // center alignment
    })
  }, [amount, color])

  return <Marker position={position} icon={icon} />
}
