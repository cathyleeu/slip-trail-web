import { request } from '@lib/httpFetcher'
import { queryKeys } from '@lib/queryKeys'
import { supabaseClient } from '@lib/supabase/client'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { GeoLocation, ParsedReceipt, ReceiptListItem } from '@types'

const DEFAULT_PAGE_SIZE = 20

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

/**
 * Hook for fetching receipts list with infinite scroll
 */
export function useReceiptList(pageSize: number = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: queryKeys.receipts.lists(),
    queryFn: async ({ pageParam = 0 }) => {
      const data = await request<ReceiptListItem[]>(
        `/api/receipts?limit=${pageSize}&offset=${pageParam}`,
        { unwrapApiSuccess: true }
      )
      return {
        items: data,
        nextOffset: data.length === pageSize ? pageParam + pageSize : undefined,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 1000 * 60 * 3, // 3분
  })
}
