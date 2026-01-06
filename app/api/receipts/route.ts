import { supabaseServer } from '@lib/supabase/server'
import type { ParsedReceipt } from '@types'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer()

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 요청 body 파싱
    const body = await req.json()
    const { receipt, location } = body as {
      receipt: ParsedReceipt
      location?: { latitude: number; longitude: number } | null
    }

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt data is required' }, { status: 400 })
    }

    // receipts 테이블에 저장
    const { data, error } = await supabase
      .from('receipts')
      .insert({
        user_id: user.id,
        vendor: receipt.vendor,
        address: receipt.address,
        phone: receipt.phone,
        purchased_at: receipt.purchased_at,
        currency: receipt.currency,
        subtotal: receipt.subtotal,
        total: receipt.total,
        raw_text: receipt.raw_text,
        items: receipt.items,
        charges: receipt.charges,
        latitude: location?.latitude,
        longitude: location?.longitude,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving receipt:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, receipt: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await supabaseServer()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, receipts: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
