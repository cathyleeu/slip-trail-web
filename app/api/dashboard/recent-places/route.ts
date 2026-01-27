import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'

export const GET = withAuth(async (req, { supabase }) => {
  const { data, error } = await supabase.rpc('dashboard_recent_places', { limit_n: 10 })

  if (error) {
    throw new Error(`Failed to load recent places: ${error.message}`)
  }

  return apiSuccess(data ?? [])
})
