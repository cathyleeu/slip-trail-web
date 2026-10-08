import type { ParsedReceipt } from '@types'

type ReceiptItem = ParsedReceipt['items'][number]
type ReceiptCharge = ParsedReceipt['charges'][number]

export function draftTotal(items: ReceiptItem[], charges: ReceiptCharge[], subtotal: number | null): number | null {
  if (items.some((item) => item.quantity === null || item.price === null) ||
      charges.some((charge) => charge.amount === null)) return null
  const base = items.length ? items.reduce((sum, item) => sum + item.quantity! * item.price!, 0) : subtotal
  return base === null ? null : base + charges.reduce((sum, charge) => sum + charge.amount!, 0)
}

