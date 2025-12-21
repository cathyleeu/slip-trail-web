'use client'

import { useCamera } from '@hooks/useCamera'
import { useOcr } from '@hooks/useOcr'
import { compressImage } from '@utils/compressImage'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface OCRResult {
  success: boolean
  data: Array<{ text: string; confidence: number; bbox: number[][] }>
  raw_text: string
}

export default function CameraPage() {
  const { videoRef, startCamera, photoUrl, photoBlob, takePhoto, showRetake, resetPhoto } =
    useCamera()
  const { runOcr, data: ocrResult, loading, reset } = useOcr()
  const [, setLegacyResult] = useState<OCRResult | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)

  useEffect(() => {
    startCamera()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOCR = async () => {
    if (!photoBlob || loading || isPreparing) return
    try {
      setIsPreparing(true)
      const compressedFile = await compressImage(photoBlob)

      reset()

      const result = await runOcr({ file: compressedFile })

      // Keep legacy state shape for now (optional)
      if (result.success) {
        setLegacyResult({
          success: true,
          data: (result.data ?? []).map((x) => ({
            text: x.text,
            confidence: x.confidence ?? 0,
            bbox: x.bbox ?? [],
          })),
          raw_text: result.raw_text,
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsPreparing(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen relative">
      <video ref={videoRef} className="w-full h-full object-cover" />
      {photoUrl && (
        <div className="absolute inset-0 w-full h-full bg-black/70 flex items-center justify-center">
          <Image src={photoUrl} alt="Captured" fill className="object-cover" />
        </div>
      )}

      {/* 하단 버튼들 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-50">
        {showRetake ? (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg"
              onClick={resetPhoto}
            >
              다시 찍기
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg"
              onClick={handleOCR}
              disabled={loading || isPreparing}
            >
              업로드
            </motion.button>
          </>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 border-4 border-white bg-red-500 text-white rounded-full shadow-lg"
            onClick={takePhoto}
          />
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 w-full h-full bg-black/50 flex items-center justify-center z-50">
          <div className="text-white text-lg">처리 중...</div>
        </div>
      )}

      {/* OCR 결과 표시 */}
      {ocrResult && (
        <div className="absolute top-4 left-4 right-4 bg-white/90 p-4 rounded-lg max-h-64 overflow-y-auto z-50">
          <h3 className="font-bold mb-2">OCR Result:</h3>
          <pre className="text-xs">{ocrResult.success ? ocrResult.raw_text : ocrResult.error}</pre>
        </div>
      )}
    </div>
  )
}
