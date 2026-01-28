'use client'

import { log } from '@lib/logger'
import { useAnalysisDraftStore } from '@store'
import { compressImage } from '@utils/imageProcessor'
import { useCallback, useState } from 'react'
import { useAnalysisMutation } from './useAnalysisMutation'

type AnalyzeReceiptOptions = {
  receiptFile: File | Blob
  onError?: (error: string) => void
}

export function useAnalysisFlow() {
  const { analyze, reset } = useAnalysisMutation()
  const { setLocation, setReceipt, clearPreview, setPreviewUrl, previewUrl } =
    useAnalysisDraftStore()
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
        setPreviewUrl(URL.createObjectURL(compressedFile))

        reset()

        const result = await analyze({
          file: compressedFile,
          onProgress: (progress, stage) => {
            setProgress(progress)
            setStage(stage)
          },
        })

        if (result.success) {
          setReceipt(result.receipt)
          setLocation(result.location)
          clearPreview()
          return result
        } else {
          // Error callback
          clearPreview()
          onError?.(result.error)
          return result
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        log.error('Receipt analysis failed', error, { stage: 'analysis flow' })
        clearPreview()
        onError?.(errorMessage)
        throw error
      } finally {
        setIsProcessing(false)
      }
    },
    [analyze, reset, setReceipt, setLocation, setPreviewUrl, clearPreview]
  )

  return {
    analyzeReceipt,
    isProcessing,
    progress,
    stage,
    previewUrl,
  }
}
