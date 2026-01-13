'use client'

import { ProcessingDialog } from '@components'
import { useAnalysisFlow } from '@hooks'
import { useAnalysisDraftStore } from '@store'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function UploadPage() {
  const router = useRouter()
  const { analyzeReceipt, isProcessing, progress, stage } = useAnalysisFlow()
  const { previewUrl, setPreviewUrl, clearPreview } = useAnalysisDraftStore()
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.files?.[0] ?? null
    setReceiptFile(next)

    if (next) setPreviewUrl(URL.createObjectURL(next))
    else clearPreview()
  }

  const openFilePicker = () => {
    if (isProcessing) return
    fileInputRef.current?.click()
  }

  const onReset = () => {
    setReceiptFile(null)
    clearPreview()
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
    <>
      <div className="h-full overflow-auto p-4 space-y-4 flex-1 flex flex-col items-center justify-around">
        <div className="relative w-full aspect-3/4 overflow-hidden bg-white rounded-2xl shadow-sm">
          {previewUrl ? (
            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
          ) : (
            <>
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
                className="h-full w-full px-3 py-2 text-sm text-blue-950"
                onClick={openFilePicker}
                disabled={isProcessing}
              >
                {receiptFile ? receiptFile.name : '이미지를 선택해주세요'}
              </motion.button>
            </>
          )}
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            disabled={isProcessing}
            className="w-full py-3 bg-white rounded-2xl shadow-sm text-gray-800 font-medium"
          >
            초기화
          </motion.button>
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
        imageUrl={previewUrl}
        progress={progress}
        stage={stage}
      />
    </>
  )
}
