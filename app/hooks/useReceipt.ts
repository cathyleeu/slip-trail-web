import { supabaseClient } from '@lib/supabase/client'
import type { GeoLocation, ParsedReceipt } from '@types'

type ReceiptPayload = {
  receipt: ParsedReceipt
  location: GeoLocation
  imageFile: File
}

export function useReceipt() {
  const supabase = supabaseClient()

  function fetchAllReceipts(userId: string) {
    return supabase.from('receipts').select('*').eq('user_id', userId)
  }

  function fetchReceiptById(id: string) {
    return supabase.from('receipts').select('*').eq('id', id).single()
  }

  async function saveReceipt({ receipt, location, imageFile }: ReceiptPayload) {
    const form = new FormData()
    form.append('image', imageFile, imageFile.name)
    form.append('receipt', JSON.stringify(receipt))
    form.append('place', JSON.stringify(location))
    return await fetch('/api/receipts', {
      method: 'POST',
      body: form,
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
