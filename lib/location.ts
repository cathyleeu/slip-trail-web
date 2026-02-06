import type { GeoLocation, NominatimResponse, Place } from '@types'

/**
 * normalize address for consistent storage and comparison
 */
export function normalizeAddress(address?: string | null): string | null {
  if (!address) return null

  return address
    .normalize('NFKC') // 유니코드 표기 흔들림 최소화(전세계용 필수)
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars 제거
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // 문자/숫자/공백만 남김(언어권 포함)
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * map NominatimResponse to GeoLocation
 * change string lat/lon to number lat/lon
 */
export function toGeoLocation(api: NominatimResponse): GeoLocation {
  return {
    lat: Number(api.lat),
    lon: Number(api.lon),
    address: api.display_name,
    displayName: api.name || '',
    placeId: api.place_id,
    boundingBox: api.boundingbox.map(Number) as [number, number, number, number],
  }
}

/**
 * map NominatimResponse to Place DB entity
 */
export function toPlace(api: NominatimResponse): Place {
  return {
    osm_ref: `${api.osm_type}:${api.osm_id}`,
    name: api.name || '',
    address: api.display_name,
    normalized_address: normalizeAddress(api.display_name),
    lat: Number(api.lat),
    lon: Number(api.lon),
  }
}
