'use client'

import { Header, ReceiptCard, Skeleton } from '@components'
import { useReceiptList } from '@hooks/useReceipt'
import { useEffect, useRef } from 'react'

export default function ReceiptsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useReceiptList()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const target = loadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allReceipts = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="All Receipts" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10" rounded="rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-gray-500">Failed to load receipts</div>
        ) : allReceipts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-gray-500">No receipts yet</p>
            <p className="text-sm text-gray-400 mt-1">Scan your first receipt to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allReceipts.map((receipt) => (
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {isFetchingNextPage ? (
                <div className="text-sm text-gray-400">Loading more...</div>
              ) : hasNextPage ? (
                <div className="text-sm text-gray-300">Scroll for more</div>
              ) : allReceipts.length > 0 ? (
                <div className="text-sm text-gray-400">You&apos;ve seen all receipts</div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
