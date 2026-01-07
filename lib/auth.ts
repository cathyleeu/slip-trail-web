import type { SupabaseClient } from '@supabase/supabase-js'
import { apiError } from './apiResponse'

export async function requireAuth(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false as const,
      response: apiError('Unauthorized', { status: 401 }),
    }
  }

  return {
    ok: true as const,
    user,
  }
}
