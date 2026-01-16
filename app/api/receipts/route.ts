import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { supabaseServer } from '@lib/supabase/server'
import type { ParsedReceipt, Place } from '@types'

function requireFormJson<T>(form: FormData, key: string): T {
  const v = form.get(key)
  if (typeof v !== 'string') throw new Error(`${key} is required and must be a string`)
  try {
    return JSON.parse(v) as T
  } catch {
    throw new Error(`Invalid JSON in field "${key}"`)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer()
    const auth = await requireAuth(supabase)
    if (!auth.ok) return auth.response

    const form = await req.formData()
    const image = form.get('image')
    if (!(image instanceof File)) return apiError('image file is required', { status: 400 })

    const receipt = requireFormJson<ParsedReceipt>(form, 'receipt')
    const place = requireFormJson<Place>(form, 'place')

    // 1) Storage 업로드
    const extFromType = image.type === 'image/webp' ? 'webp' : 'bin'
    const filename = `${auth.user.id}/${Date.now()}.${extFromType}`

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('sliptrail-bills')
      .upload(filename, image, {
        contentType: image.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadErr) return apiError(uploadErr.message, { status: 500 })

    const { data: pub } = supabase.storage.from('sliptrail-bills').getPublicUrl(uploadData.path)

    const { data, error } = await supabase.rpc('save_receipt_with_place', {
      receipt: receipt,
      place: place,
      img_url: pub.publicUrl,
    })

    if (error) return apiError('Failed to save receipt', { status: 500, details: error.message })

    return apiSuccess(data)
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return apiError(error.message, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Invalid JSON')) {
      return apiError(error.message, { status: 400 })
    }
    console.error('Unexpected error:', error)
    return apiError('Unexpected error occurred', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await supabaseServer()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return apiError('Unauthorized', { status: 401 })
    }

    // URL 파라미터로 필터링 옵션 제공 가능
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 사용자의 영수증 목록 조회
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching receipts:', error)
      return apiError(error.message, { status: 500 })
    }

    return apiSuccess(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return apiError('Unexpected error occurred', { status: 500 })
  }
}
