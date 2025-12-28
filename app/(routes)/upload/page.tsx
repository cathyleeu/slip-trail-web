'use client'

import { ProcessingDialog } from '@components'
import { useAnalysisFlow } from '@hooks'
import { useReceiptImageStore } from '@store'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function UploadPage() {
  const router = useRouter()
  const { analyzeReceipt, isProcessing, progress, stage } = useAnalysisFlow()
  const { imageUrl, setImageUrl, clearImageUrl } = useReceiptImageStore()
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.files?.[0] ?? null
    setReceiptFile(next)

    if (next) setImageUrl(next)
    else clearImageUrl()
  }

  const openFilePicker = () => {
    if (isProcessing) return
    fileInputRef.current?.click()
  }

  const onReset = () => {
    setReceiptFile(null)
    clearImageUrl()
  }

  const onRunOcr = async () => {
    if (!receiptFile) return

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-sm rounded-3xl bg-white overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">영수증 스캔</div>
            <h1 className="text-lg font-bold text-gray-900">이미지 업로드</h1>
          </div>
          <button
            type="button"
            className="text-sm text-blue-600 font-medium"
            onClick={onReset}
            disabled={isProcessing}
          >
            초기화
          </button>
        </div>

        <div className="p-5 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            className="w-full px-3 py-2 text-sm text-blue-950 rounded-2xl bg-gray-50 border border-gray-200"
            onClick={openFilePicker}
            disabled={isProcessing}
          >
            {receiptFile ? receiptFile.name : '이미지를 선택해주세요'}
          </motion.button>

          <div className="relative w-full aspect-3/4 overflow-hidden rounded-2xl bg-gray-100">
            {imageUrl ? (
              <Image src={imageUrl} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                미리보기
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl disabled:opacity-50"
            onClick={onRunOcr}
            disabled={!receiptFile || isProcessing}
          >
            분석 요청
          </motion.button>
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
