import { withAuth } from '@lib/apiHandler'
import { apiError, apiSuccess } from '@lib/apiResponse'

const MAX_ADDRESS_LENGTH = 500

export const POST = withAuth(async (req) => {
  const body = await req.json()
  const { address, multiple } = body

  if (typeof address !== 'string' || !address.trim()) {
    return apiError('Address required', { status: 400 })
  }

  if (address.length > MAX_ADDRESS_LENGTH) {
    return apiError('Address too long', { status: 422 })
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', multiple ? '5' : '1')
  url.searchParams.set('addressdetails', '1')

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'SlipTrail/1.0 (https://github.com/cathyleeu/slip-trail-web)',
      Referer: 'https://github.com/cathyleeu/slip-trail-web',
      Accept: 'application/json',
    },
  })

  const data = await res.json()

  if (!Array.isArray(data) || data.length === 0) {
    return apiError('Address not found', { status: 404 })
  }

  return apiSuccess(multiple ? data : data[0])
})
