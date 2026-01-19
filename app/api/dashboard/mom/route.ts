import { apiError, apiSuccess } from '@lib/apiResponse'
import { requireAuth } from '@lib/auth'
import { supabaseServer } from '@lib/supabase/server'

export async function GET() {
  try {
    const supabase = await supabaseServer()
    const auth = await requireAuth(supabase)
    if (!auth.ok) return auth.response

    const { data, error } = await supabase.rpc('dashboard_mom')
    if (error) return apiError('Failed to load MoM', { status: 500, details: error.message })

    return apiSuccess((data?.[0] ?? null) as unknown)
  } catch (e) {
    return apiError('Unexpected error', {
      status: 500,
      details: e instanceof Error ? e.message : String(e),
    })
  }
}
