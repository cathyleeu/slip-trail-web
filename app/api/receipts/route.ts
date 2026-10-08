import { withAuth } from '@lib/apiHandler'
import { apiError, apiSuccess } from '@lib/apiResponse'
import { DEFAULT_LIMIT, DEFAULT_OFFSET, ERROR_MESSAGES, IMAGE_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES, STORAGE_BUCKET } from '@lib/constants'
import { type Place, parseFormJson, parseFormJsonOptional, parsedReceiptSchema, placeSchema } from '@lib/validation'

export const POST = withAuth(async (req, { user, supabase }) => {
  const form = await req.formData()
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

  // 1) Storage 업로드
  const filename = `${user.id}/${crypto.randomUUID()}.${extension}`

  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, image, {
      contentType: image.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadErr) {
    throw new Error(`${ERROR_MESSAGES.STORAGE_UPLOAD_FAILED}: ${uploadErr.message}`)
  }

  const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadData.path)

  // Versioned RPC requires the atomic-save migration; never fall back to an older function.
  let saved
  try {
    saved = await supabase.rpc('save_receipt_with_place_v2', {
      receipt,
      place,
      img_url: pub.publicUrl,
    })
  } catch {
    saved = { data: null, error: { code: '', message: 'Save outcome is unknown' } }
  }
  const { data, error } = saved

  if (error || !data?.id) {
    // SQLSTATE errors confirm the transaction failed. Connection errors and cancellation
    // can race a commit, so an empty reconciliation result alone cannot justify deletion.
    const confirmedFailure = error && /^[0-9A-Z]{5}$/.test(error.code)
      && !error.code.startsWith('08') && error.code !== '57014' && error.code !== '40003'
    if (confirmedFailure) {
      const { error: cleanupError } = await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path])
      if (cleanupError) throw new Error('Receipt save failed and image cleanup failed')
    } else {
      const { data: existing, error: lookupError } = await supabase.from('receipts')
        .select('id').eq('user_id', user.id).eq('img_url', pub.publicUrl).maybeSingle()
      if (!lookupError && existing) return apiSuccess(existing)
      return apiError('Receipt save outcome is unknown. Please check your receipts before retrying.', { status: 503 })
    }
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_SAVE_RECEIPT}: ${error?.message ?? 'Missing receipt ID'}`)
  }

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
