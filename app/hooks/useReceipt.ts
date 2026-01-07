import { supabaseClient } from '@lib/supabase/client'
import type { GeoLocation, ParsedReceipt } from '@types'

export function useReceipt() {
  const supabase = supabaseClient()

  function fetchAllReceipts(userId: string) {
    return supabase.from('receipts').select('*').eq('user_id', userId)
  }

  function fetchReceiptById(id: string) {
    return supabase.from('receipts').select('*').eq('id', id).single()
  }

  async function saveReceipt(receipt: ParsedReceipt, location: GeoLocation) {
    return await fetch('/api/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt,
        location,
      }),
    })
  }

  async function updateReceipt(receiptId: string, receipt: ParsedReceipt, location: GeoLocation) {
    return await fetch(`/api/receipts/${receiptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt,
        location,
      }),
    })
  }

  return {
    fetchAllReceipts,
    fetchReceiptById,
    saveReceipt,
    updateReceipt,
  }
}
