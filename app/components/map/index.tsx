'use client'

import type { GeoLocation } from '@types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

type MapProps = {
  location?: GeoLocation | null
  zoom?: number
  className?: string
  style?: React.CSSProperties
}

// TODO: marker style customization: emoji, color options
// popup content customization by props: address, custom text
export default function Map({ location, zoom = 15, className = 'h-full w-full', style }: MapProps) {
  // Fix for default marker icon
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DefaultIcon = L.Icon.Default as any
    delete DefaultIcon.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  }, [])

  // Validate location has valid coordinates
  const isValidLocation =
    location &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    !isNaN(location.lat) &&
    !isNaN(location.lng)

  const center: [number, number] = isValidLocation
    ? [location.lat, location.lng]
    : [49.2827, -123.1207]

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className}
      style={style}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {isValidLocation && (
        <Marker position={[location.lat, location.lng]}>
          <Popup>{location.address}</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
