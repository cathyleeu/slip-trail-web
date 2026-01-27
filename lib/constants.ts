/**
 * Application-wide constants
 */

// ============ API Defaults ============

export const DEFAULT_PERIOD = 'last30' as const
export const DEFAULT_LIMIT = 50 as const
export const DEFAULT_OFFSET = 0 as const
export const MAX_LIMIT = 100 as const

// ============ Dashboard Constants ============

export const TOP_PLACES_LIMIT = 10 as const
export const RECENT_PLACES_LIMIT = 10 as const

// ============ Currency ============

export const DEFAULT_CURRENCY = 'CAD' as const

// ============ Storage ============

export const STORAGE_BUCKET = 'sliptrail-bills' as const

// ============ Supported Image Types ============

export const SUPPORTED_IMAGE_TYPES = {
  WEBP: 'image/webp',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
} as const

// ============ Error Messages ============

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  IMAGE_REQUIRED: 'Image file is required',
  RECEIPT_NOT_FOUND: 'Receipt not found',
  NO_DATA_TO_UPDATE: 'No data to update',
  VALIDATION_ERROR: 'Validation error',
  UNEXPECTED_ERROR: 'Unexpected error occurred',
} as const

// ============ Success Messages ============

export const SUCCESS_MESSAGES = {
  RECEIPT_SAVED: 'Receipt saved successfully',
  RECEIPT_UPDATED: 'Receipt updated successfully',
  RECEIPT_DELETED: 'Receipt deleted successfully',
} as const
