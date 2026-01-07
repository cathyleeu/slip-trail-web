import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { supabaseServer } from '@lib/supabase/server'
import type { ParsedReceipt, Place } from '@types'

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer()

    const auth = await requireAuth(supabase)
    if (!auth.ok) return auth.response

    // 요청 body 파싱
    const body = await req.json()
    const { receipt, place } = body as {
      receipt: ParsedReceipt
      place: Place
      img_url?: string | null
    }

    if (!receipt) return apiError('Receipt data is required', { status: 400 })
    if (!place) return apiError('Place data is required', { status: 400 })

    const { data, error } = await supabase.rpc('save_receipt_with_place', {
      receipt: body.receipt,
      place: body.place,
      img_url: body.imgUrl ?? null,
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
