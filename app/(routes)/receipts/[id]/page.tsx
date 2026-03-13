'use client'

import { Button, Card, IconButton } from '@components/ui'
import { ChevronLeftIcon, LocationPin } from '@components/ui/icons'
import { useReceiptDetail } from '@hooks'
import { getCategoryEmoji, getCategoryLabel } from '@lib/categories'
import { getFeelingStyle } from '@lib/feelings'
import { cn } from '@utils/cn'
import { formatDateTime, money } from '@utils/format'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'

export default function ReceiptDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: receipt, isLoading, error } = useReceiptDetail(id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-24 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Receipt not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const categoryEmoji = getCategoryEmoji(receipt.category)
  const categoryLabel = getCategoryLabel(receipt.category)
  const feelingStyle = getFeelingStyle(receipt.feeling)
  const displayDate = receipt.purchased_at || receipt.created_at

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <IconButton variant="ghost" onClick={() => router.back()}>
          <ChevronLeftIcon className="w-5 h-5" />
        </IconButton>
        <h1 className="text-lg font-semibold flex-1">Receipt Details</h1>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {/* Receipt Image */}
        {receipt.img_url && (
          <Card className="overflow-hidden">
            <div className="relative aspect-3/4 w-full">
              <Image
                src={receipt.img_url}
                alt="Receipt"
                fill
                className="object-contain bg-gray-100"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </Card>
        )}

        {/* Vendor & Category */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl shrink-0">
              {categoryEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{receipt.vendor}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{categoryLabel}</p>
              <p className="text-sm text-gray-400 mt-1">{formatDateTime(displayDate)}</p>
            </div>
            {feelingStyle && (
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium shrink-0',
                  feelingStyle.bg,
                  feelingStyle.text
                )}
              >
                {receipt.feeling}
              </span>
            )}
          </div>
        </Card>

        {/* Location */}
        {(receipt.place_name || receipt.place_address || receipt.address) && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <LocationPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {receipt.place_name && (
                  <p className="font-medium text-gray-900">{receipt.place_name}</p>
                )}
                <p className="text-sm text-gray-500">{receipt.place_address || receipt.address}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Items */}
        {receipt.items && receipt.items.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
            <div className="space-y-2">
              {receipt.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">{item.name}</p>
                    {item.quantity > 1 && <p className="text-sm text-gray-500">x{item.quantity}</p>}
                  </div>
                  <span className="text-gray-900 font-medium shrink-0 ml-3">
                    {money(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Charges & Totals */}
        <Card className="p-4">
          <div className="space-y-2">
            {receipt.subtotal !== null && (
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{money(receipt.subtotal)}</span>
              </div>
            )}
            {receipt.charges?.map((charge, index) => (
              <div key={index} className="flex justify-between text-gray-600">
                <span>{charge.label || charge.type}</span>
                <span>{money(charge.amount)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>{receipt.total ? money(receipt.total) : '-'}</span>
            </div>
          </div>
        </Card>

        {/* Memo */}
        {receipt.memo && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Memo</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{receipt.memo}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
