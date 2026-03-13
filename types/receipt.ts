import type { AddressNormalized } from './address'
/**
 * Receipt domain types
 * Receipt parsing results and related entities
 */

/**
 * Receipt item (individual product)
 */
export type ReceiptItem = {
  name: string
  quantity: number
  price: number
}

/**
 * Additional charge types (tax, tip, discount, etc.)
 */
export enum ChargeType {
  TAX = 'tax',
  TIP = 'tip',
  DISCOUNT = 'discount',
  FEE = 'fee',
}

/**
 * Receipt additional charges
 */
export type ReceiptCharge = {
  type: ChargeType
  label: string
  amount: number
}

/**
 * Parsed receipt data
 */

export type ReceiptCategory =
  | 'restaurant'
  | 'coffee'
  | 'mart'
  | 'bar'
  | 'fast_food'
  | 'bakery'
  | 'pharmacy'
  | 'gas'
  | 'other'

export interface ParsedReceipt {
  vendor: string
  category: ReceiptCategory
  address: string | null
  address_normalized: AddressNormalized
  phone: string | null
  purchased_at: string
  items: ReceiptItem[]
  currency: string | null
  subtotal: number | null
  charges: ReceiptCharge[]
  total: number | null
  raw_text: string
}

/**
 * Receipt parsing success result
 */
export type ParseReceiptSuccess = {
  success: true
  receipt: ParsedReceipt
}

/**
 * Receipt parsing failure result
 */
export type ParseReceiptFailure = {
  success: false
  error: string
  details?: unknown
}

/**
 * Receipt parsing result (success or failure)
 */
export type ParseReceiptResult = ParseReceiptSuccess | ParseReceiptFailure

/**
 * Receipt parsing request options
 */
export type RequestParsingOptions = {
  rawText: string
}

/**
 * Feeling tag for purchase sentiment tracking
 */
export type FeelingTag =
  | 'Necessary'
  | 'Impulsive'
  | 'Social'
  | 'Treat'
  | 'Routine'
  | 'Stress'
  | 'Celebration'

/**
 * Receipt item from database (for list view)
 */
export type ReceiptListItem = {
  id: string
  vendor: string
  category: ReceiptCategory | null
  total: number | null
  purchased_at: string | null
  created_at: string
  feeling: FeelingTag | null
  memo: string | null
  img_url: string | null
}

/**
 * Full receipt detail from database
 */
export type ReceiptDetail = {
  id: string
  vendor: string
  category: ReceiptCategory | null
  address: string | null
  phone: string | null
  purchased_at: string | null
  created_at: string
  currency: string
  subtotal: number | null
  total: number | null
  items: ReceiptItem[] | null
  charges: ReceiptCharge[] | null
  feeling: FeelingTag | null
  memo: string | null
  img_url: string | null
  lat: number | null
  lon: number | null
  place_name: string | null
  place_address: string | null
}
