/**
 * Receipt analysis integrated workflow
 * Complete process: OCR → Parsing → Geocoding
 */

import type { GeoLocation, Place } from './location'
import type { OcrResult } from './ocr'
import type { ParsedReceipt } from './receipt'

/**
 * Analysis start options
 */
export type AnalyzeOptions = {
  file: File
}

export type LocationStatus = 'found' | 'no_address' | 'not_found' | 'error'

/**
 * Receipt analysis success result
 */
export type ReceiptAnalysisSuccess = {
  success: true
  ocr: Extract<OcrResult, { success: true }>
  receipt: ParsedReceipt
  location: GeoLocation | null
  place: Place | null
  locationStatus: LocationStatus
}

/**
 * Receipt analysis failure result
 */
export type ReceiptAnalysisFailure = {
  success: false
  stage: 'ocr' | 'parse' | 'geocode'
  error: string
  details?: unknown
}

/**
 * Receipt analysis result (success or failure)
 */
export type ReceiptAnalysisResult = ReceiptAnalysisSuccess | ReceiptAnalysisFailure

export type Period = 'last7' | 'last30' | 'ytd'
