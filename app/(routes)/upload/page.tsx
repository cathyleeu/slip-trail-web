'use client'

import { useOcr } from '@hooks/useOcr'
import { compressImage } from '@utils/compressImage'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function UploadPage() {
  const { runOcr, data: ocrResult, loading, reset } = useOcr()
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.files?.[0] ?? null
    setFile(next)
    reset()
  }

  const onPickClick = () => {
    fileInputRef.current?.click()
  }

  const onRunOcr = async () => {
    if (!file) return
    try {
      const compressedFile = await compressImage(file)
      reset()
      await runOcr({ file: compressedFile })
    } catch (error) {
      console.error('Error:', error)
    }
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
              setFile(null)
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
                {file ? file.name : '이미지를 선택해주세요'}
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                className="px-3 py-2 text-sm rounded-lg bg-white border border-gray-200"
                onClick={onPickClick}
                disabled={loading}
              >
                선택
              </motion.button>
            </div>
          </div>

          <div className="relative w-full aspect-3/4 overflow-hidden rounded-2xl bg-gray-100">
            {previewUrl ? (
              <Image src={previewUrl} alt="Preview" fill className="object-cover" />
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
            disabled={!file || loading}
          >
            OCR 요청
          </motion.button>

          {ocrResult && (
            <div className="rounded-2xl bg-gray-50 p-4 max-h-56 overflow-y-auto">
              <div className="text-sm font-semibold text-gray-900 mb-2">추출 결과</div>
              <pre className="text-xs whitespace-pre-wrap text-gray-800">
                {ocrResult.success ? ocrResult.raw_text : ocrResult.error}
              </pre>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 w-full h-full bg-black/40 flex items-center justify-center z-50">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-center">
            <div className="text-sm font-semibold text-gray-900">Processing...</div>
            <div className="mt-1 text-xs text-gray-500">Extracting details</div>
          </div>
        </div>
      )}
    </div>
  )
}
