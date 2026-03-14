'use client'

import { ProcessingDialog } from '@components'
import { Button } from '@components/ui'
import { Close } from '@components/ui/icons'
import { useAnalysisFlow, useCamera } from '@hooks'
import { useAnalysisDraftStore } from '@store'
import { toWebp } from '@utils/imageProcessor'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CameraPage() {
  const {
    videoRef,
    startCamera,
    photoUrl,
    photoBlob: receiptFile,
    takePhoto,
    showRetake,
    resetPhoto,
    error: cameraError,
  } = useCamera()
  const router = useRouter()
  const { analyzeReceipt, isProcessing, progress, stage, previewUrl } = useAnalysisFlow()
  const { setPreviewUrl, clearPreview, setFile } = useAnalysisDraftStore()

  useEffect(() => {
    startCamera()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (photoUrl) setPreviewUrl(photoUrl)
    if (receiptFile) {
      toWebp(receiptFile).then(setFile)
    }
  }, [photoUrl, setPreviewUrl, receiptFile, setFile])

  const handleRetake = () => {
    resetPhoto()
    clearPreview()
  }

  const handleAnalyze = async () => {
    if (!receiptFile || isProcessing) return

    await analyzeReceipt({
      receiptFile,
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
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center text-white p-0 hover:bg-white/10"
        >
          <Close className="w-8 h-8" />
        </Button>
        <span className="text-white text-sm font-medium">SCAN RECEIPT</span>
        <div className="w-10" />
      </div>

      {/* Camera/Photo View */}
      <div className="flex-1 relative">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-white text-sm leading-relaxed">{cameraError}</p>
          </div>
        ) : photoUrl ? (
          <div className="absolute inset-0">
            <Image src={photoUrl} alt="Captured" fill className="object-contain" />
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

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
              <Button
                whileTap={{ scale: 0.95 }}
                onClick={handleRetake}
                className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full"
              >
                Retake
              </Button>
              <Button
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                disabled={isProcessing}
                className="px-8 py-3 rounded-full"
              >
                {isProcessing ? 'Processing...' : 'Continue'}
              </Button>
            </>
          ) : (
            <Button
              whileTap={{ scale: 0.95 }}
              onClick={takePhoto}
              className="w-16 h-16 rounded-full bg-white border-4 border-blue-500 shadow-lg p-0"
            />
          )}
        </div>
      </div>

      {/* Processing Dialog */}
      <ProcessingDialog
        isOpen={isProcessing}
        imageUrl={previewUrl}
        progress={progress}
        stage={stage}
      />
    </div>
  )
}
