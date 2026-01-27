import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'

export const GET = withAuth(async (req, { supabase }) => {
  const { data, error } = await supabase.rpc('dashboard_mom')

  if (error) {
    throw new Error(`Failed to load MoM: ${error.message}`)
  }

  return apiSuccess((data?.[0] ?? null) as unknown)
})
