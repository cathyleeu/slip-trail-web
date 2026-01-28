import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { ERROR_MESSAGES } from '@lib/constants'
import type { MoMRow } from '@types'

export const GET = withAuth(async (req, { supabase }) => {
  const { data, error } = await supabase.rpc('dashboard_mom')

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_LOAD_MOM}: ${error.message}`)
  }

  return apiSuccess<MoMRow | null>(data?.[0] ?? null)
})
