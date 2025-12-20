'use client'

import imageCompression from 'browser-image-compression'

export function blobToFile(blob: Blob, fileName = new Date().toISOString()): File {
  return new File([blob], fileName, { type: blob.type, lastModified: Date.now() })
}

export async function compressImage(
  blob: Blob,
  fileName = new Date().toISOString()
): Promise<File> {
  if (!blob) throw new Error('No file provided')
  const compressed = await imageCompression(blobToFile(blob, fileName), {
    maxWidthOrHeight: 1500, // OCR-friendly resolution
    maxSizeMB: 0.4, // limit final size (~300–400KB)
    initialQuality: 0.85, // preserve text sharpness
    useWebWorker: true, // speed up compression
  })

  return compressed
}
