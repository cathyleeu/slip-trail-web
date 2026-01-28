import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { DEFAULT_LIMIT, DEFAULT_OFFSET, ERROR_MESSAGES, STORAGE_BUCKET } from '@lib/constants'
import { parseFormJson, parsedReceiptSchema, placeSchema } from '@lib/validation'

export const POST = withAuth(async (req, { user, supabase }) => {
  const form = await req.formData()
  const image = form.get('image')

  if (!(image instanceof File)) {
    throw new Error(ERROR_MESSAGES.IMAGE_REQUIRED)
  }

  const receipt = parseFormJson(form, 'receipt', parsedReceiptSchema)
  const place = parseFormJson(form, 'place', placeSchema)

  // 1) Storage 업로드
  const extFromType = image.type === 'image/webp' ? 'webp' : 'bin'
  const filename = `${user.id}/${Date.now()}.${extFromType}`

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

  const { data, error } = await supabase.rpc('save_receipt_with_place', {
    receipt: receipt,
    place: place,
    img_url: pub.publicUrl,
  })

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_SAVE_RECEIPT}: ${error.message}`)
  }

  return apiSuccess(data)
})

export const GET = withAuth(async (req, { user, supabase }) => {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))
  const offset = parseInt(searchParams.get('offset') || String(DEFAULT_OFFSET))

  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_FETCH_RECEIPTS}: ${error.message}`)
  }

  return apiSuccess(data)
})
