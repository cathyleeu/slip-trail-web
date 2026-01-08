import type { ImageFormat } from '@types'

/**
 * mapping MIME type by image format
 */
export const MIME_TYPES: Record<ImageFormat, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
} as const

/**
 * get image format from MIME type
 */
export function getFormatFromMime(mimeType: string): ImageFormat | null {
  const entry = Object.entries(MIME_TYPES).find(([_, mime]) => mime === mimeType)
  return entry ? (entry[0] as ImageFormat) : null
}

/**
 * get MIME type from image format
 */
export function getMimeType(format: ImageFormat): string {
  return MIME_TYPES[format]
}
