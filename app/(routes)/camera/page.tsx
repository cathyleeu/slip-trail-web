'use client'

import { useCamera } from '@hooks/useCamera'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useEffect } from 'react'

export default function CameraPage() {
  const { videoRef, startCamera, photo, takePhoto, showRetake, resetPhoto } = useCamera()

  useEffect(() => {
    startCamera()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-col items-center justify-center h-screen relative">
      <video ref={videoRef} className="w-full h-full object-cover" />
      {photo && (
        <div className="absolute inset-0 w-full h-full bg-black/70 flex items-center justify-center">
          <Image src={photo} alt="Captured" fill className="object-cover" />
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 border-white border-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-400 transition z-50"
        onClick={showRetake ? resetPhoto : takePhoto}
      ></motion.button>
    </div>
  )
}
