import { supabaseServer } from '@lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const file = form.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase.storage
    .from('sliptrail-bills')
    .upload(`${user.id}/${Date.now()}_${file.name}`, file, { contentType: file.type })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const publicUrl = supabase.storage.from('sliptrail-bills').getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl.data.publicUrl })
}
