import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { supabaseServer } from '@lib/supabase/server'
import type { ParsedReceipt, Place } from '@types'

function requireFormString(form: FormData, key: string): string {
  const v = form.get(key)
  if (typeof v !== 'string') throw new Error(`${key} is required`)
  return v
}

export async function POST(req: Request) {
  const form = await req.formData()

  const file = form.get('file')
  if (!(file instanceof File)) return apiError('No file uploaded', { status: 400 })

  let receipt: ParsedReceipt
  let place: Place
  try {
    receipt = JSON.parse(requireFormString(form, 'receipt')) as ParsedReceipt
    place = JSON.parse(requireFormString(form, 'place')) as Place
  } catch {
    return apiError('Invalid JSON in receipt/place', { status: 400 })
  }

  try {
    const supabase = await supabaseServer()

    const auth = await requireAuth(supabase)
    if (!auth.ok) return auth.response

    const { data: imageData, error: imageError } = await supabase.storage
      .from('sliptrail-bills')
      .upload(`${auth.user.id}/${Date.now()}_${file.name}`, file, { contentType: file.type })

    if (imageError) return apiError(imageError.message, { status: 500 })
    const {
      data: { publicUrl },
    } = supabase.storage.from('sliptrail-bills').getPublicUrl(imageData.path)

    const { data, error } = await supabase.rpc('save_receipt_with_place', {
      receipt: receipt,
      place: place,
      img_url: publicUrl,
    })

    if (error) return apiError('Failed to save receipt', { status: 500, details: error.message })

    return apiSuccess(data)
  } catch (error) {
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
