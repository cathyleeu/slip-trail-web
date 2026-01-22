export type SeriesPoint = {
  label: string
  total: number
}

export type SpendChartProps = {
  points: SeriesPoint[]
}

export type SummaryRow = {
  total_spent: string // numeric -> string으로 오는 경우 많음
  receipt_count: number
  avg_receipt: string
}

export type SeriesRow = {
  bucket_start: string
  total_spent: string
  receipt_count: number
}

export type PlaceRow = {
  place_id: string
  name: string | null
  normalized_address: string | null
  lat: number | null
  lon: number | null
  last_visited_at?: string | null
  visit_count: number | null
  total_spent?: string | null
}
