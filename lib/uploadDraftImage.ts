import type { ImageFormat } from '@types'
import { requireAuth } from './auth'
import { supabaseClient } from './supabase/client'

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET!

type DraftUploadResult = {
  draftPath: string
  previewUrl: string
}

export async function uploadDraftImage(
  file: File,
  format: ImageFormat
): Promise<DraftUploadResult> {
  const supabase = supabaseClient()

  const auth = await requireAuth(supabase)
  if (!auth.ok) throw new Error('Unauthorized')

  const draftPath = `draft/${auth.user.id}/${crypto.randomUUID()}.${format}`

  const { data, error } = await supabase.storage.from(BUCKET).upload(draftPath, file, {
    contentType: `image/${format}`,
    upsert: false,
    cacheControl: '3600',
  })

  if (error) throw error
  const path = data.path

  // 버킷이 public인 경우:
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { draftPath: path, previewUrl: urlData.publicUrl }
}
