'use client'

import { useMapDraftStore, useReceiptDraftStore } from '@store'
import { compressImage } from '@utils/compressImage'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useAnalysisMutation } from './useAnalysisMutation'

type AnalyzeReceiptOptions = {
  receiptImg: File | Blob
  onError?: (error: string) => void
}

export function useAnalysisFlow() {
  const router = useRouter()
  const { analyze, reset } = useAnalysisMutation()
  const { setDraft } = useReceiptDraftStore()
  const { setLocation } = useMapDraftStore()
  const [isPreparing, setIsPreparing] = useState(false)

  const analyzeReceipt = useCallback(
    async ({ receiptImg, onError }: AnalyzeReceiptOptions) => {
      try {
        setIsPreparing(true)
        const compressedFile = await compressImage(receiptImg)
        reset()

        const result = await analyze({ file: compressedFile })

        if (result.success) {
          // Zustand store에 결과 저장
          setDraft(result.receipt)
          setLocation(result.location)
          router.push('/result')
          return result
        } else {
          // 에러 콜백
          onError?.(result.error)
          return result
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Analysis error:', error)
        onError?.(errorMessage)
        throw error
      } finally {
        setIsPreparing(false)
      }
    },
    [analyze, reset, setDraft, setLocation, router]
  )

  return {
    analyzeReceipt,
    isPreparing,
  }
}
