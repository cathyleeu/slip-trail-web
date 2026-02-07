import type { AddressComponents, AddressNormalized, AddressQuality } from '../types/address'

/**
 * Deterministic address normalization for geocoding.
 * - query excludes postal_code and country.
 * - alternates are stable, ordered, and unique.
 */
export function buildAddressNormalized(input: {
  raw_address_text?: string | null
  components: AddressComponents
}): AddressNormalized {
  const raw_address_text = (input.raw_address_text ?? '').trim()

  // 1) Normalize whitespace everywhere (deterministic)
  const c = normalizeComponents(input.components)

  // 2) Compute query parts (NO postal/country)
  const street = buildStreet(c.house_number, c.road)
  const city = c.city ?? null
  const regionPart = c.region_code ?? c.region ?? null

  const query = buildQuery([street, city, regionPart])

  // 3) Alternates in fixed order (NO postal/country)
  const alternates: string[] = []
  if (query) {
    // (1) query without unit — our query never includes unit by default,
    // but keep the rule for future-proofing in case you decide to include unit.
    const queryWithoutUnit = query // no-op by design
    pushUnique(alternates, queryWithoutUnit)

    // (2) drop region
    const altDropRegion = buildQuery([street, city])
    if (altDropRegion) pushUnique(alternates, altDropRegion)

    // (3) drop house_number (road only)
    const altDropHouse = buildQuery([c.road ?? null, city, regionPart])
    if (altDropHouse) pushUnique(alternates, altDropHouse)

    // Remove the primary query from alternates if present (we want alternates != query)
    const filtered = alternates.filter((a) => a !== query)
    alternates.length = 0
    alternates.push(...filtered)
  }

  // 4) Quality scoring (deterministic)
  const quality = scoreQuality({ street, city, regionPart })

  // 5) Notes (minimal)
  const notes = buildNotes(c, { street, city, regionPart })

  return {
    raw_address_text,
    components: c,
    query,
    alternates,
    quality,
    notes,
  }
}

/* ---------------- helpers ---------------- */

function normalizeComponents(components: AddressComponents): AddressComponents {
  const cleaned: AddressComponents = { ...components }

  // Trim and collapse spaces
  ;(Object.keys(cleaned) as (keyof AddressComponents)[]).forEach((k) => {
    const v = cleaned[k]
    cleaned[k] = typeof v === 'string' ? normalizeSpace(v) : v
  })

  // Normalize region dots into region_code where applicable: "B.C." -> "BC"
  const regionCodeFromRegion = dotStrippedRegionCode(cleaned.region)
  const regionCodeFromRegionCode = dotStrippedRegionCode(cleaned.region_code)

  // Prefer explicit region_code, but if it's dotted, clean it.
  const finalRegionCode =
    regionCodeFromRegionCode ??
    (isLikelyRegionCode(cleaned.region_code) ? cleaned.region_code : null) ??
    regionCodeFromRegion ??
    null

  // If we derived a region_code from dotted region, null out region to avoid duplicates.
  if (finalRegionCode) {
    cleaned.region_code = finalRegionCode
    if (regionCodeFromRegion && cleaned.region && dotStrippedRegionCode(cleaned.region)) {
      cleaned.region = null
    }
    if (
      regionCodeFromRegionCode &&
      cleaned.region_code &&
      dotStrippedRegionCode(components.region_code)
    ) {
      // If original region_code was dotted, ensure region is untouched.
    }
  }

  // Optional: normalize house_number to keep only leading token (e.g. "1425-2" keep as-is)
  // Keep as-is; receipts may have legit formats.

  // We do NOT normalize postal/country here since query excludes them.
  return cleaned
}

function normalizeSpace(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function dotStrippedRegionCode(value: string | null): string | null {
  if (!value) return null
  const v = value.trim()

  // Match dotted abbreviations like "B.C." "N.Y." "B C" "B. C."
  const letters = v.replace(/[^A-Za-z]/g, '')
  if (letters.length >= 2 && letters.length <= 3) {
    // Only accept if original looked abbreviation-ish (contained dots or was short)
    const hasDots = v.includes('.')
    const short = v.length <= 6
    if (hasDots || short) return letters.toUpperCase()
  }
  return null
}

function isLikelyRegionCode(value: string | null): boolean {
  if (!value) return false
  const v = value.trim()
  return /^[A-Za-z]{2,3}$/.test(v)
}

function buildStreet(houseNumber: string | null, road: string | null): string | null {
  if (houseNumber && road) return `${houseNumber} ${road}`
  if (road) return road
  return null
}

function buildQuery(parts: Array<string | null>): string | null {
  const kept = parts.map((p) => (p ? normalizeSpace(p) : null)).filter(Boolean) as string[]
  if (kept.length < 2) return null // require at least 2 parts to avoid junk
  return kept.join(', ')
}

function pushUnique(arr: string[], value: string) {
  const v = normalizeSpace(value)
  if (!v) return
  if (!arr.includes(v)) arr.push(v)
}

function scoreQuality(input: {
  street: string | null
  city: string | null
  regionPart: string | null
}): AddressQuality {
  const { street, city, regionPart } = input

  const hasStreetNumber = !!street && /\d/.test(street)
  const hasRoad = !!street // street includes road if exists
  const hasCity = !!city
  const hasRegion = !!regionPart

  if (hasStreetNumber && hasRoad && hasCity && hasRegion) return 'high'
  if ((hasRoad && hasCity && hasRegion) || (hasRoad && hasCity)) return 'medium'
  return 'low'
}

function buildNotes(
  c: AddressComponents,
  derived: { street: string | null; city: string | null; regionPart: string | null }
): string | null {
  const notes: string[] = []
  if (!derived.street) notes.push('missing street')
  if (!derived.city) notes.push('missing city')
  if (!derived.regionPart) notes.push('missing region')
  // If postal looks mixed case and might be Canadian but we won't use it in query:
  if (c.postal_code && /[A-Za-z]/.test(c.postal_code) && /[a-z]/.test(c.postal_code)) {
    notes.push('postal code has lowercase')
  }
  return notes.length ? notes.join('; ') : null
}
