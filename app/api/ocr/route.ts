import { withAuth } from '@lib/apiHandler'
import { apiError, apiSuccess } from '@lib/apiResponse'
import { IMAGE_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES } from '@lib/constants'

export const POST = withAuth(async (request) => {
  const timeout = AbortSignal.timeout(30000)
  const signal = AbortSignal.any([request.signal, timeout])

  try {
    signal.throwIfAborted()
    let form: FormData
    try {
      form = await request.formData()
    } catch {
      signal.throwIfAborted()
      return apiError('Invalid multipart image input', { status: 400 })
    }

    const image = form.get('image')
    if (!(image instanceof File) || image.size === 0) {
      return apiError('Image file is required', { status: 400 })
    }
    if (!Object.hasOwn(IMAGE_EXTENSIONS, image.type)) {
      return apiError('Unsupported image type', { status: 422 })
    }
    if (image.size > MAX_UPLOAD_SIZE_BYTES) {
      return apiError('Image exceeds the 10MB limit', { status: 413 })
    }

    const url = process.env.OCR_API_URL
    const key = process.env.OCR_API_KEY
    if (!url || !key) {
      return apiError('OCR service is not configured', { status: 503 })
    }

    const body = new FormData()
    body.append('image', image, `receipt.${IMAGE_EXTENSIONS[image.type]}`)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'X-API-Key': key },
      body,
      signal,
      redirect: 'error',
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 429 || response.status === 503) {
        return apiError('OCR service is busy. Please try again.', { status: 503 })
      }
      return apiError('OCR service failed', { status: 502 })
    }

    const data: unknown = await response.json()
    signal.throwIfAborted()
    if (
      typeof data !== 'object' || data === null || !('text' in data) ||
      typeof data.text !== 'string' || !data.text.trim()
    ) {
      return apiError('OCR returned no readable text', { status: 502 })
    }
    return apiSuccess({ text: data.text })
  } catch {
    if (request.signal.aborted) {
      return apiError('OCR request cancelled', { status: 499 })
    }
    if (timeout.aborted) {
      return apiError('OCR request timed out. Please try again.', { status: 504 })
    }
    return apiError('OCR service unavailable', { status: 502 })
  }
})
