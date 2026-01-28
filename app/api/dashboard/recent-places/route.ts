import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { RECENT_PLACES_LIMIT } from '@lib/constants'

export const GET = withAuth(async (req, { supabase }) => {
  const { data, error } = await supabase.rpc('dashboard_recent_places', {
    limit_n: RECENT_PLACES_LIMIT,
  })

  if (error) {
    throw new Error(`Failed to load recent places: ${error.message}`)
  }

  return apiSuccess(data ?? [])
})
