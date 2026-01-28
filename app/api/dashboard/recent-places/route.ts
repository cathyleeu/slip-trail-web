import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { ERROR_MESSAGES, RECENT_PLACES_LIMIT } from '@lib/constants'

export const GET = withAuth(async (req, { supabase }) => {
  const { data, error } = await supabase.rpc('dashboard_recent_places', {
    limit_n: RECENT_PLACES_LIMIT,
  })

  if (error) {
    throw new Error(`${ERROR_MESSAGES.FAILED_TO_LOAD_RECENT_PLACES}: ${error.message}`)
  }

  return apiSuccess(data ?? [])
})
