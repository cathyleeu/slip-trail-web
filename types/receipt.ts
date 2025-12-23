/**
 * Receipt domain types
 * Receipt parsing results and related entities
 */

/**
 * Receipt item (individual product)
 */
export type ReceiptItem = {
  name: string
  qty: number
  unit_price: number
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
export interface ParsedReceipt {
  vendor: string
  address: string | null
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
