'use client'

import { Card } from '@components/ui'
import type { FeelingTag, ReceiptListItem } from '@types'
import { cn } from '@utils/cn'
import { formatDateTime, money } from '@utils/format'
import Link from 'next/link'

const CATEGORY_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  coffee: '☕',
  mart: '🛒',
  bar: '🍺',
  fast_food: '🍔',
  bakery: '🥐',
  pharmacy: '💊',
  gas: '⛽',
  other: '📦',
}

const FEELING_STYLES: Record<FeelingTag, { bg: string; text: string }> = {
  Necessary: { bg: 'bg-green-100', text: 'text-green-700' },
  Impulsive: { bg: 'bg-red-100', text: 'text-red-700' },
  Social: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Treat: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Routine: { bg: 'bg-gray-100', text: 'text-gray-700' },
  Stress: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Celebration: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
}

type ReceiptCardProps = {
  receipt: ReceiptListItem
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const categoryEmoji = receipt.category ? CATEGORY_EMOJI[receipt.category] || '📦' : '📦'
  const feelingStyle = receipt.feeling ? FEELING_STYLES[receipt.feeling] : null
  const displayDate = receipt.purchased_at || receipt.created_at

  return (
    <Link href={`/receipts/${receipt.id}`} className="block">
      <Card className="p-4 hover:shadow-md transition-shadow active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Category emoji + vendor info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
              {categoryEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{receipt.vendor}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(displayDate)}</p>
              {receipt.memo && (
                <p className="text-sm text-gray-400 mt-1 truncate">{receipt.memo}</p>
              )}
            </div>
          </div>

          {/* Right: Total + feeling tag */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-lg font-bold text-gray-900">
              {receipt.total ? money(receipt.total) : '-'}
            </span>
            {feelingStyle && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  feelingStyle.bg,
                  feelingStyle.text
                )}
              >
                {receipt.feeling}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
