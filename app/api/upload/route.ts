import { withAuth } from '@lib/apiHandler'
import { apiError, apiSuccess } from '@lib/apiResponse'
import { IMAGE_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES, STORAGE_BUCKET, SUPPORTED_IMAGE_TYPES } from '@lib/constants'

export const POST = withAuth(async (request, { user, supabase }) => {
  const form = await request.formData()
  const file = form.get('file') as File

  if (!file) return apiError('No file uploaded', { status: 400 })

  const extension = IMAGE_EXTENSIONS[file.type]
  if (!extension) {
    return apiError('Unsupported file type', {
      status: 422,
      details: `Supported types: ${Object.values(SUPPORTED_IMAGE_TYPES).join(', ')}`,
    })
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return apiError('File too large', {
      status: 422,
      details: `Maximum file size is ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB`,
    })
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(`${user.id}/${Date.now()}.${extension}`, file, { contentType: file.type })

  if (error) return apiError(error.message, { status: 500 })

  const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)

  return apiSuccess({ url: publicUrl.data.publicUrl })
})
