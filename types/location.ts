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
  lat: number
  lon: number
  displayName?: string
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
  place: Place
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
 * Place (location entity for DB storage)
 */
export type Place = {
  osm_ref: string
  name: string
  address: string
  normalized_address?: string | null
  lat: number
  lon: number
}
