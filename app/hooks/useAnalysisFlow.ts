'use client'

import { useMapDraftStore, useReceiptDraftStore, useReceiptImageStore } from '@store'
import { compressImage } from '@utils/compressImage'
import { useCallback, useState } from 'react'
import { useAnalysisMutation } from './useAnalysisMutation'

type AnalyzeReceiptOptions = {
  receiptFile: File | Blob
  onError?: (error: string) => void
}

export function useAnalysisFlow() {
  const { analyze, reset } = useAnalysisMutation()
  const { setDraft } = useReceiptDraftStore()
  const { setLocation } = useMapDraftStore()
  const { imageUrl, setImageUrl, clearImageUrl } = useReceiptImageStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('Starting...')

  const analyzeReceipt = useCallback(
    async ({ receiptFile, onError }: AnalyzeReceiptOptions) => {
      try {
        setIsProcessing(true)
        setProgress(0)
        setStage('Starting...')

        const compressedFile = await compressImage(receiptFile)
        setImageUrl(compressedFile)

        reset()

        const result = await analyze({
          file: compressedFile,
          onProgress: (progress, stage) => {
            setProgress(progress)
            setStage(stage)
          },
        })

        if (result.success) {
          setDraft(result.receipt)
          setLocation(result.location)
          clearImageUrl()
          return result
        } else {
          // Error callback
          clearImageUrl()
          onError?.(result.error)
          return result
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Analysis error:', error)
        clearImageUrl()
        onError?.(errorMessage)
        throw error
      } finally {
        setIsProcessing(false)
      }
    },
    [analyze, reset, setDraft, setLocation, setImageUrl, clearImageUrl]
  )

  return {
    analyzeReceipt,
    isProcessing,
    progress,
    stage,
    imageUrl,
  }
}
