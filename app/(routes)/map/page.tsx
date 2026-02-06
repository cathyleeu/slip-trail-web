'use client'

import dynamic from 'next/dynamic'
const Map = dynamic(() => import('@components/map'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading map...</div>,
})

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-116px)] relative">
      <Map className="h-full" />
    </div>
  )
}
