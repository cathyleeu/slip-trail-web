/**
 * OCR (Optical Character Recognition) types
 * External OCR API responses and result handling
 */

/**
 * External OCR API response structure (e.g., HuggingFace Space)
 */
export type ExternalOcrApiResponse = {
  text: string
}

/**
 * OCR success result
 */
export type OcrSuccess = {
  success: true
  text: string
}

/**
 * OCR failure result
 */
export type OcrFailure = {
  success: false
  error: string
  details?: string
}

/**
 * OCR result (success or failure)
 */
export type OcrResult = OcrSuccess | OcrFailure
