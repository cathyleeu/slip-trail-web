'use client'

import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'

export type OcrLine = {
  text: string
  confidence?: number
  bbox?: number[][]
}

export type OcrSuccess = {
  success: true
  raw_text: string
  data?: OcrLine[]
}

export type OcrFailure = {
  success: false
  error: string
  details?: string
}

export type OcrResult = OcrSuccess | OcrFailure

type RunOcrOptions = {
  file: File
}

async function ocrRequest({ file }: RunOcrOptions): Promise<OcrResult> {
  const url = process.env.NEXT_PUBLIC_OCR_API_URL
  if (!url) return { success: false, error: 'NEXT_PUBLIC_OCR_API_URL is not set' }

  const formData = new FormData()
  formData.append('image', file, file.name)

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  // FIXME: intergrate LLM parsing

  const json: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    const err =
      typeof json === 'object' && json !== null && 'error' in json
        ? String((json as { error?: unknown }).error ?? 'OCR request failed')
        : 'OCR request failed'

    const details =
      typeof json === 'object' && json !== null && 'details' in json
        ? String((json as { details?: unknown }).details ?? '')
        : undefined

    return { success: false, error: err, details }
  }

  return json as OcrResult
}

export function useOcr() {
  const mutation = useMutation({
    mutationFn: ocrRequest,
  })

  const runOcr = useCallback(
    async (options: RunOcrOptions) => {
      return mutation.mutateAsync(options)
    },
    [mutation]
  )

  return {
    runOcr,
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    reset: mutation.reset,
  }
}
