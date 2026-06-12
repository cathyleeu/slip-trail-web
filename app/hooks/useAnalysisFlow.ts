'use client'

import { log } from '@lib/logger'
import { useAnalysisDraftStore } from '@store'
import { compressImage, toWebp } from '@utils/imageProcessor'
import { useCallback, useRef, useState } from 'react'
import { useAnalysisMutation } from './useAnalysisMutation'

type AnalyzeReceiptOptions = {
  receiptFile: File | Blob
  onError?: (error: string) => void
}

const ANALYSIS_TIMEOUT_MS = 45000

export function useAnalysisFlow() {
  const { analyze, reset } = useAnalysisMutation()
  const { setLocation, setLocationStatus, setPlace, setReceipt, clearPreview, setPreviewUrl, previewUrl, setFile } =
    useAnalysisDraftStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('Starting...')
  const controllerRef = useRef<AbortController | null>(null)

  const cancelAnalysis = useCallback(() => {
    controllerRef.current?.abort()
  }, [])

  const analyzeReceipt = useCallback(
    async ({ receiptFile, onError }: AnalyzeReceiptOptions) => {
      const controller = new AbortController()
      controllerRef.current = controller
      const timeoutId = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS)

      try {
        setIsProcessing(true)
        setProgress(0)
        setStage('Starting...')

        const compressedFile = await compressImage(receiptFile)
        const webpFile = await toWebp(compressedFile)
        setFile(webpFile)
        setPreviewUrl(URL.createObjectURL(webpFile))

        reset()

        const result = await analyze({
          file: compressedFile,
          onProgress: (progress, stage) => {
            setProgress(progress)
            setStage(stage)
          },
          signal: controller.signal,
        })

        if (result.success) {
          setReceipt(result.receipt)
          setLocation(result.location)
          setLocationStatus(result.locationStatus)
          setPlace(result.place)
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
        clearTimeout(timeoutId)
        controllerRef.current = null
        setIsProcessing(false)
      }
    },
    [analyze, reset, setReceipt, setPlace, setLocation, setLocationStatus, setPreviewUrl, clearPreview, setFile]
  )

  return {
    analyzeReceipt,
    cancelAnalysis,
    isProcessing,
    progress,
    stage,
    previewUrl,
  }
}
