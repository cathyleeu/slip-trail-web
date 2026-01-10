'use client'

import { MIME_TYPES } from '@app/lib'
import type { ImageFormat } from '@types'
import imageCompression from 'browser-image-compression'

export async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = url
  })
}

export function blobToFile(blob: Blob, fileName = new Date().toISOString()): File {
  return new File([blob], fileName, { type: blob.type, lastModified: Date.now() })
}

export async function convertImage(
  img: HTMLImageElement,
  opts: {
    format?: ImageFormat
    max?: number
    quality?: number
    fileName?: string
  } = {}
) {
  const format = opts.format ?? 'webp'
  const max = opts.max ?? 1500
  const quality = opts.quality ?? 0.82
  const fileName = opts.fileName ?? `receipt-${Date.now()}.${format}`
  const { width, height } = fit(img.width, img.height, max)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  ctx.drawImage(img, 0, 0, width, height)

  const mimeType = MIME_TYPES[format]
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error(`${format.toUpperCase()} encode failed`))),
      mimeType,
      quality
    )
  })

  return blobToFile(blob, fileName)
}

export const toWebp = (
  img: HTMLImageElement,
  opts: Omit<Parameters<typeof convertImage>[1], 'format'> = {}
) => convertImage(img, { ...opts, format: 'webp' })

export async function compressImage(
  blob: Blob,
  fileName = new Date().toISOString()
): Promise<File> {
  if (!blob) throw new Error('No file provided')
  const compressed = await imageCompression(blobToFile(blob, fileName), {
    maxWidthOrHeight: 1500, // OCR-friendly resolution
    initialQuality: 0.85, // preserve text sharpness
    useWebWorker: true, // speed up compression
  })

  return compressed
}

function fit(w: number, h: number, max: number) {
  const scale = Math.min(max / w, max / h, 1)
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}
