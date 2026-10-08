import { withAuth } from '@lib/apiHandler'
import { apiError, apiSuccess } from '@lib/apiResponse'
import { coerceCategory, parseReceipt } from '@lib/groq'
import { log } from '@lib/logger'
import { receiptDraftSchema } from '@lib/validation'

const MAX_RAW_TEXT_LENGTH = 20000

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.rawText !== 'string') {
      return apiError('rawText is required and must be a string', { status: 400 })
    }

    const rawText: string = body.rawText

    // verify OCR result minimum validation
    if (rawText.trim().length < 30) {
      return apiError('OCR text too short', {
        status: 422,
        details: 'The provided OCR text is not sufficient for parsing',
      })
    }

    if (rawText.length > MAX_RAW_TEXT_LENGTH) {
      return apiError('OCR text too long', {
        status: 422,
        details: `OCR text must not exceed ${MAX_RAW_TEXT_LENGTH} characters`,
      })
    }

    // request LLM to parse receipt
    let llmResponse: string | null = null
    try {
      llmResponse = await parseReceipt(rawText)
    } catch (err) {
      log.apiError('/api/parse-receipt', err, { stage: 'LLM request' })
      return apiError('LLM request failed', {
        status: 502,
      })
    }

    if (!llmResponse) {
      return apiError('LLM returned empty response', { status: 502 })
    }

    try {
      const parsedJson: unknown = JSON.parse(llmResponse)
      if (!parsedJson || typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
        throw new Error('Expected receipt object')
      }
      const result = receiptDraftSchema.safeParse({
        ...parsedJson,
        category: coerceCategory((parsedJson as Record<string, unknown>).category),
      })
      if (!result.success) {
        throw new Error('Invalid receipt draft')
      }
      return apiSuccess({ ...result.data, raw_text: rawText })
    } catch {
      log.warn('Invalid receipt draft returned by LLM')
      return apiError('Could not parse receipt. Please try again.', { status: 502 })
    }
  } catch (err) {
    log.apiError('/api/parse-receipt', err, { stage: 'unhandled' })

    return apiError('Internal server error', {
      status: 500,
    })
  }
})
