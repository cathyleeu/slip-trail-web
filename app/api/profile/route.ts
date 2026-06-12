import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { supabaseServer } from '@lib/supabase/server'

export async function PATCH(req: Request) {
  const supabase = await supabaseServer()
  const auth = await requireAuth(supabase)
  if (!auth.ok) return auth.response

  const { display_name } = await req.json()

  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name })
    .eq('id', auth.user.id)
    .select('id, name, created_at, updated_at')
    .single()

  if (error) return apiError(error.message, { status: 400 })
  return apiSuccess(data)
}
