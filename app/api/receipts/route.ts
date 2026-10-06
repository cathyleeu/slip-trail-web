import { withAuth } from '@lib/apiHandler'
import { apiError, apiSuccess } from '@lib/apiResponse'
import { DEFAULT_LIMIT, DEFAULT_OFFSET, ERROR_MESSAGES, IMAGE_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES, STORAGE_BUCKET } from '@lib/constants'
import { type Place, parseFormJson, parseFormJsonOptional, parsedReceiptSchema, placeSchema } from '@lib/validation'
import { z } from 'zod'

export const POST = withAuth(async (req, { user, supabase }) => {
  const form = await req.formData()
  const submission = z.uuid().safeParse(form.get('submission_id'))
  if (!submission.success) return apiError('A valid submission ID is required', { status: 400 })
  const submissionId = submission.data
  const findSubmission = () => supabase.from('receipts').select('id, img_url')
    .eq('user_id', user.id).eq('submission_id', submissionId).maybeSingle()
  const { data: existing, error: lookupError } = await findSubmission()
  if (lookupError) return apiError('Unable to check receipt submission. Please try again.', { status: 503 })
  if (existing) return apiSuccess(existing)

  const image = form.get('image')
  if (!(image instanceof File) || image.size === 0) {
    return apiError(ERROR_MESSAGES.IMAGE_REQUIRED, { status: 400 })
  }
  const extension = IMAGE_EXTENSIONS[image.type]
  if (!Object.hasOwn(IMAGE_EXTENSIONS, image.type)) return apiError('Unsupported file type', { status: 422 })
  if (image.size > MAX_UPLOAD_SIZE_BYTES) {
    return apiError('File too large', { status: 422 })
  }

  const receipt = parseFormJson(form, 'receipt', parsedReceiptSchema)
  const place = parseFormJsonOptional(form, 'place', placeSchema) as Place | null

  // Each attempt owns its upload; a losing retry can only clean up its own path.
  const filename = `${user.id}/${submissionId}/${crypto.randomUUID()}.${extension}`
  const storage = supabase.storage.from(STORAGE_BUCKET)
  const { data: uploadData, error: uploadErr } = await storage.upload(filename, image, {
    contentType: image.type,
    upsert: false,
  })
  if (uploadErr) {
    throw new Error(`${ERROR_MESSAGES.STORAGE_UPLOAD_FAILED}: ${uploadErr.message}`)
  }
  const { data: pub } = storage.getPublicUrl(uploadData.path)
  const cleanup = async () => {
    const { error } = await storage.remove([uploadData.path])
    if (error) throw new Error('Receipt save completed or failed, but unused image cleanup failed')
  }

  let saved
  try {
    saved = await supabase.rpc('save_receipt_submission', {
      receipt, place, img_url: pub.publicUrl, submission_id: submissionId,
    })
  } catch {
    saved = { data: null, error: { code: '', message: 'Save outcome is unknown' } }
  }
  const { data, error } = saved
  if (error || !data?.id || typeof data.img_url !== 'string') {
    // Only a definite transaction failure permits unconditional cleanup.
    const confirmedFailure = error && /^[0-9A-Z]{5}$/.test(error.code)
      && !error.code.startsWith('08') && error.code !== '57014' && error.code !== '40003'
    if (confirmedFailure) {
      await cleanup()
      throw new Error(`${ERROR_MESSAGES.FAILED_TO_SAVE_RECEIPT}: ${error.message}`)
    }
    const { data: committed, error: reconcileError } = await findSubmission()
    if (!reconcileError && committed) {
      if (committed.img_url !== pub.publicUrl) await cleanup()
      return apiSuccess(committed)
    }
    // An in-flight commit may still reference this upload. Retain it for reconciliation.
    return apiError('Receipt save outcome is unknown. Please retry with the same submission.', { status: 503 })
  }
  if (data.img_url !== pub.publicUrl) await cleanup()
  return apiSuccess(data)
})

export const GET = withAuth(async (req, { user, supabase }) => {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))
  const offset = parseInt(searchParams.get('offset') || String(DEFAULT_OFFSET))

  const { data, error } = await supabase
    .from('receipts')
    .select('id, vendor, category, total, purchased_at, created_at, feeling, memo, img_url')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_FETCH_RECEIPTS}: ${error.message}`)
  }

  return apiSuccess(data)
})
