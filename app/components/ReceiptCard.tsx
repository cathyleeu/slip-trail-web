'use client'

import { Card } from '@components/ui'
import { getCategoryEmoji } from '@lib/categories'
import { FEELING_STYLES, getFeelingBorderColor } from '@lib/feelings'
import type { FeelingTag, ReceiptListItem } from '@types'
import { cn } from '@utils/cn'
import { formatRelativeTime, money } from '@utils/format'
import Link from 'next/link'

type ReceiptCardProps = {
  receipt: ReceiptListItem
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const categoryEmoji = getCategoryEmoji(receipt.category)
  const displayDate = receipt.purchased_at || receipt.created_at
  const feelingStyle = receipt.feeling
    ? FEELING_STYLES[receipt.feeling as FeelingTag]
    : null
  const borderColor = getFeelingBorderColor(receipt.feeling)

  return (
    <Link href={`/receipts/${receipt.id}`} className="block">
      <Card
        className={cn(
          'px-4 py-3.5 border-l-[3px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow active:scale-[0.99]',
          borderColor
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center text-lg shrink-0">
              {categoryEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-fg truncate leading-tight">{receipt.vendor}</h3>
              <p className="text-xs text-fg-subtle mt-0.5">{formatRelativeTime(displayDate)}</p>
              {receipt.memo && (
                <p className="text-xs text-fg-subtle mt-0.5 truncate">{receipt.memo}</p>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-xl font-black text-fg tracking-tight tabular-nums">
              {receipt.total ? money(receipt.total) : '—'}
            </span>
            {receipt.feeling && feelingStyle && (
              <p className={cn('text-xs font-medium mt-0.5', feelingStyle.text)}>
                {receipt.feeling}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
