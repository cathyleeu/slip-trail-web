/**
 * Address normalization types
 * OCR → normalized address for geocoding
 */

export type AddressQuality = 'high' | 'medium' | 'low'

export type AddressComponents = {
  unit: string | null
  house_number: string | null
  road: string | null
  neighborhood: string | null
  city: string | null
  district_or_county: string | null
  region: string | null
  region_code: string | null
  postal_code: string | null
  country: string | null
  country_code: string | null
}

export type AddressNormalized = {
  raw_address_text: string
  components: AddressComponents
  query: string | null
  alternates: string[]
  quality: AddressQuality
  notes: string | null
}
