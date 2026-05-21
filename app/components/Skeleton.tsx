'use client'

import { cn } from '@utils/cn'

export function Skeleton({
  className,
  rounded = 'rounded-xl',
}: {
  className?: string
  rounded?: string
}) {
  return <div className={cn('animate-pulse bg-neutral-200/70', rounded, className)} />
}
