'use client'

import { IconButton, LocationPin, Spinner } from '@components/ui'
import type { GeoLocation } from '@types'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const Map = dynamic(() => import('@components/map'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading map...</div>,
})

export default function MapPage() {
  const [location, setLocation] = useState<GeoLocation | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateLocation = (position: GeolocationPosition, doneLoading = false) => {
    setLocation({
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      address: 'Current Location',
    })
    setError(null)
    if (doneLoading) setIsLoading(false)
  }

  const handleGeoError = (error: GeolocationPositionError) => {
    let message = 'Unable to retrieve your location'
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location permission denied. Please enable location access in your browser.'
        break
      case error.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable.'
        break
      case error.TIMEOUT:
        message = 'Location request timed out. Please try again.'
        break
    }
    setError(message)
    setIsLoading(false)
    console.error('Geolocation error:', error)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsLoading(true)
    setError(null)

    const successHandler = (position: GeolocationPosition) => updateLocation(position, true)

    const errorHandler = (error: GeolocationPositionError) => {
      // 고정밀 모드 실패 시 일반 모드로 재시도
      if (error.code === error.TIMEOUT) {
        console.log('High accuracy timeout, retrying with lower accuracy...')
        navigator.geolocation.getCurrentPosition(
          (pos) => updateLocation(pos, true),
          handleGeoError,
          {
            enableHighAccuracy: false, // 일반 모드로 재시도
            timeout: 10000,
            maximumAge: 60000, // 1분 이내 캐시 허용
          }
        )
        return
      }

      handleGeoError(error)
    }

    // 먼저 고정밀 모드로 시도
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 15000, // 15초로 증가
      maximumAge: 0,
    })
  }

  useEffect(() => {
    getCurrentLocation()

    if (!navigator.geolocation) return

    const successHandler = (position: GeolocationPosition) => updateLocation(position)

    const errorHandler = (error: GeolocationPositionError) => {
      console.error('Watch position error:', error)
    }

    // Watch position for updates (일반 모드로 안정적으로)
    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: false, // 배터리 절약 및 안정성
      timeout: 15000,
      maximumAge: 30000, // 30초 캐시 허용
    })

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return (
    <div className="h-[calc(100vh-116px)] relative">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-md text-sm">
          {error}
        </div>
      )}

      <IconButton
        onClick={getCurrentLocation}
        disabled={isLoading}
        className="absolute bottom-20 right-4 z-9999"
        title="current location"
        variant="filled"
        size="md"
        shape="circle"
      >
        {isLoading ? <Spinner /> : <LocationPin />}
      </IconButton>

      <Map location={location} className="h-full" zoom={16} />
    </div>
  )
}
