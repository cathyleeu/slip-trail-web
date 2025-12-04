'use client'

import { motion } from 'motion/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
// Import map component with no SSR (client-side only)
const Map = dynamic(() => import('@components/map'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading map...</div>,
})

const MotionLink = motion(Link)

export default function MapPage() {
  return (
    <div className="w-full h-screen relative">
      <div className="relative z-10">
        <Map />
      </div>
      {/* add Tabs */}
      <MotionLink
        href="/camera"
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 font-black text-2xl bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-400 transition"
      >
        📷
      </MotionLink>
    </div>
  )
}
