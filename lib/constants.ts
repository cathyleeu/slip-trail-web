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

  // Database operations
  FAILED_TO_SAVE_RECEIPT: 'Failed to save receipt',
  FAILED_TO_FETCH_RECEIPT: 'Failed to fetch receipt',
  FAILED_TO_FETCH_RECEIPTS: 'Failed to fetch receipts',
  FAILED_TO_UPDATE_RECEIPT: 'Failed to update receipt',
  FAILED_TO_DELETE_RECEIPT: 'Failed to delete receipt',

  // Storage operations
  STORAGE_UPLOAD_FAILED: 'Storage upload failed',

  // Dashboard operations
  FAILED_TO_LOAD_SPEND_SERIES: 'Failed to load spend series',
  FAILED_TO_LOAD_TIMESERIES: 'Failed to load timeseries',
  FAILED_TO_LOAD_SUMMARY: 'Failed to load summary',
  FAILED_TO_LOAD_MOM: 'Failed to load MoM',
  FAILED_TO_LOAD_TOP_PLACES: 'Failed to load top places',
  FAILED_TO_LOAD_RECENT_PLACES: 'Failed to load recent places',
  FAILED_TO_LOAD_CATEGORY_BREAKDOWN: 'Failed to load category breakdown',
} as const

// ============ Success Messages ============

export const SUCCESS_MESSAGES = {
  RECEIPT_SAVED: 'Receipt saved successfully',
  RECEIPT_UPDATED: 'Receipt updated successfully',
  RECEIPT_DELETED: 'Receipt deleted successfully',
} as const
