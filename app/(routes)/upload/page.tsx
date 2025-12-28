'use client'

import { ProcessingDialog } from '@components'
import { useAnalysisFlow, useAnalysisMutation } from '@hooks'
import { useReceiptImageStore } from '@store'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function UploadPage() {
  const router = useRouter()
  const { data: analysis, loading, reset } = useAnalysisMutation()
  const { analyzeReceipt, isPreparing, isProcessing, progress, stage } = useAnalysisFlow()
  const { imageUrl, setImageUrl, clearImageUrl } = useReceiptImageStore()
  const [receiptImg, setReceiptImg] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.files?.[0] ?? null
    setReceiptImg(next)
    reset()

    // setImageUrl automatically creates ObjectURL from File
    if (next) {
      setImageUrl(next)
    } else {
      clearImageUrl()
    }
  }

  const onPickClick = () => {
    if (loading || isPreparing) return
    fileInputRef.current?.click()
  }

  const onRunOcr = async () => {
    if (!receiptImg || loading || isPreparing) return

    await analyzeReceipt({
      receiptImg,
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
            onClick={() => {
              setReceiptImg(null)
              reset()
            }}
            disabled={loading}
          >
            초기화
          </button>
        </div>

        <div className="p-5 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            className="hidden"
          />

          <div className="rounded-2xl bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 truncate">
                {receiptImg ? receiptImg.name : '이미지를 선택해주세요'}
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                className="px-3 py-2 text-sm rounded-lg bg-white border border-gray-200"
                onClick={onPickClick}
                disabled={loading || isPreparing}
              >
                선택
              </motion.button>
            </div>
          </div>

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
            disabled={!receiptImg || loading || isPreparing}
          >
            분석 요청
          </motion.button>

          {analysis && (
            <div className="rounded-2xl bg-gray-50 p-4 max-h-56 overflow-y-auto">
              <div className="text-sm font-semibold text-gray-900 mb-2">추출 결과</div>
              {'success' in analysis && analysis.success ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">OCR</div>
                    <pre className="text-xs whitespace-pre-wrap text-gray-800">
                      {analysis.ocr.text}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">Parsed</div>
                    <pre className="text-xs whitespace-pre-wrap text-gray-800">
                      {JSON.stringify(analysis.receipt, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <pre className="text-xs whitespace-pre-wrap text-gray-800">
                  {'success' in analysis && !analysis.success
                    ? `[${analysis.stage}] ${analysis.error}`
                    : 'Analysis failed'}
                </pre>
              )}
            </div>
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
