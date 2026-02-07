import { apiError, apiSuccess } from '@lib/apiResponse'

export async function POST(req: Request) {
  const { address } = await req.json()

  if (!address) {
    return apiError('Address required', { status: 400 })
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '5')
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

  return apiSuccess(data[0])
}
