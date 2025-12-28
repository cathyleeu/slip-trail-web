'use client'

import { ProcessingDialog } from '@components'
import { useAnalysisFlow, useCamera } from '@hooks'
import { useReceiptImageStore } from '@store'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CameraPage() {
  const { videoRef, startCamera, photoUrl, photoBlob, takePhoto, showRetake, resetPhoto } =
    useCamera()
  const router = useRouter()
  const { analyzeReceipt, isPreparing, isProcessing, progress, stage, imageUrl } = useAnalysisFlow()
  const { setImageUrl, clearImageUrl } = useReceiptImageStore()

  useEffect(() => {
    startCamera()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 사진 촬영 후 store에 저장
  useEffect(() => {
    if (photoUrl) {
      setImageUrl(photoUrl)
    }
  }, [photoUrl, setImageUrl])

  const handleRetake = () => {
    resetPhoto()
    clearImageUrl()
  }

  const handleAnalyze = async () => {
    if (!photoBlob || isPreparing) return

    await analyzeReceipt({
      receiptImg: photoBlob,
      onError: (error) => {
        console.error('Analysis failed:', error)
        alert(`분석 실패: ${error}`)
      },
    })

    router.push('/result')
  }

  return (
    <div className="flex flex-col h-screen bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="text-white text-sm font-medium">SCAN RECEIPT</div>
        <div className="w-10" />
      </div>

      {/* Camera/Photo View */}
      <div className="flex-1 relative">
        {photoUrl ? (
          <div className="absolute inset-0">
            <Image src={photoUrl} alt="Captured" fill className="object-contain" />
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" />

            {/* Frame Guide */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full max-w-sm aspect-3/4 border-2 border-blue-400 rounded-2xl" />
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pb-8 pt-4 bg-linear-to-t from-black/80 to-transparent">
        <div className="text-center text-white text-sm mb-4">
          {showRetake ? 'Review your receipt' : 'Align receipt within frame'}
        </div>
        <div className="flex justify-center items-center gap-6">
          {showRetake ? (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleRetake}
                className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium"
              >
                Retake
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                disabled={isPreparing}
                className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium disabled:opacity-50"
              >
                {isPreparing ? 'Processing...' : 'Continue'}
              </motion.button>
            </>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={takePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-blue-500 shadow-lg"
            />
          )}
        </div>
      </div>

      {/* Processing Dialog */}
      <ProcessingDialog
        isOpen={isProcessing}
        imageUrl={imageUrl}
        progress={progress}
        stage={stage}
      />
    </div>
  )
}
