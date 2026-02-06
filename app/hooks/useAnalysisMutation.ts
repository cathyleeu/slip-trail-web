'use client'

import { ApiError, request } from '@lib/httpFetcher'
import { toGeoLocation, toPlace } from '@lib/location'
import { useMutation } from '@tanstack/react-query'
import type {
  AnalyzeOptions,
  ExternalOcrApiResponse,
  GeocodeResult,
  NominatimResponse,
  OcrResult,
  ParsedReceipt,
  ParseReceiptResult,
  ReceiptAnalysisResult,
  RequestParsingOptions,
} from '@types'

export async function requestOcr({ file }: AnalyzeOptions): Promise<OcrResult> {
  const url = process.env.NEXT_PUBLIC_OCR_API_URL
  if (!url) return { success: false, error: 'NEXT_PUBLIC_OCR_API_URL is not set' }

  const formData = new FormData()
  formData.append('image', file, file.name)

  try {
    const externalData = await request<ExternalOcrApiResponse>(url, {
      method: 'POST',
      body: formData,
    })

    if (!externalData.text) {
      return {
        success: false,
        error: 'OCR request failed',
      }
    }

    return {
      success: true,
      text: externalData.text,
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        error: err.message,
        details: typeof err.details === 'string' ? err.details : undefined,
      }
    }
    throw err
  }
}

export async function requestParsing({
  rawText,
}: RequestParsingOptions): Promise<ParseReceiptResult> {
  try {
    // 내부 API - apiSuccess 자동 unwrap
    const receipt = await request<ParsedReceipt>('/api/parse-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
      unwrapApiSuccess: true,
    })

    return { success: true, receipt }
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        error: err.message,
        details: err.details,
      }
    }
    throw err
  }
}

export async function requestGeoCoding(address: string): Promise<GeocodeResult> {
  try {
    const location = await request<NominatimResponse>('/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
      unwrapApiSuccess: true,
    })
    return { success: true, location: toGeoLocation(location), place: toPlace(location) }
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        error: err.message,
        details: err.details,
      }
    }
    throw err
  }
}

async function analyzeRequest(
  { file }: AnalyzeOptions,
  onProgress?: (progress: number, stage: string) => void
): Promise<ReceiptAnalysisResult> {
  onProgress?.(10, 'Starting OCR...')

  const ocr = await requestOcr({ file })
  if (!ocr.success) {
    return { success: false, stage: 'ocr', error: ocr.error, details: ocr.details }
  }

  onProgress?.(40, 'Parsing receipt...')

  const parsed = await requestParsing({ rawText: ocr.text })

  if (!parsed.success) {
    return { success: false, stage: 'parse', error: parsed.error, details: parsed.details }
  }

  onProgress?.(70, 'Finding location...')

  const geo = await requestGeoCoding(parsed.receipt.address || '')

  if (!geo.success) {
    return { success: false, stage: 'geocode', error: 'geocoding failed' }
  }

  onProgress?.(100, 'Complete!')

  return {
    success: true,
    ocr,
    receipt: parsed.receipt,
    location: geo.location,
    place: {
      ...geo.place,
      name: geo.place?.name || parsed.receipt.vendor || 'Unknown Place',
    },
  }
}

export function useAnalysisMutation() {
  const mutation = useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: AnalyzeOptions & { onProgress?: (progress: number, stage: string) => void }) =>
      analyzeRequest({ file }, onProgress),
  })

  return {
    analyze: mutation.mutateAsync,
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    reset: mutation.reset,
  }
}
