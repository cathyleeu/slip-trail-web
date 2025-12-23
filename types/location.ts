/**
 * Location and geocoding types
 * Nominatim OSM API, Leaflet map rendering
 */

/**
 * Nominatim OSM API raw response
 */
export type NominatimResponse = {
  addresstype: string
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: [string, string, string, string]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  name?: string
  place_rank: number
}

/**
 * Location data stored in Supabase (minimal fields)
 */
export type GeoLocation = {
  lat: number // string → number 변환
  lng: number // lon → lng 통일
  displayName: string
  address: string
  placeId?: number
  boundingBox?: [number, number, number, number]
}

/**
 * Geocoding success result
 */
export type GeocodeSuccess = {
  success: true
  location: GeoLocation
}

/**
 * Geocoding failure result
 */
export type GeocodeFailure = {
  success: false
  error: string
  details?: unknown
}

/**
 * Geocoding result (success or failure)
 */
export type GeocodeResult = GeocodeSuccess | GeocodeFailure

/**
 * Convert Nominatim response to MapLocation
 */
export function toGeoLocation(api: NominatimResponse): GeoLocation {
  return {
    lat: Number(api.lat),
    lng: Number(api.lon),
    address: api.display_name,
    displayName: api.name || '',
    placeId: api.place_id,
    boundingBox: api.boundingbox.map(Number) as [number, number, number, number],
  }
}
