import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { STORAGE_BUCKET } from '@lib/constants'
import { supabaseServer } from '@lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const file = form.get('file') as File

  if (!file) return apiError('No file uploaded', { status: 400 })

  const supabase = await supabaseServer()
  const auth = await requireAuth(supabase)
  if (!auth.ok) return auth.response

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(`${auth.user.id}/${Date.now()}_${file.name}`, file, { contentType: file.type })

  if (error) return apiError(error.message, { status: 500 })

  const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)

  return apiSuccess({ url: publicUrl.data.publicUrl })
}
