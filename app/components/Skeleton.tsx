'use client'

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

export function Skeleton({
  className,
  rounded = 'rounded-xl',
}: {
  className?: string
  rounded?: string
}) {
  return <div className={cx('animate-pulse bg-neutral-200/70', rounded, className)} />
}
