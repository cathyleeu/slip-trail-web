'use client'

import { cn } from '@utils/cn'
import Button from './Button'

export interface SegmentOption<T extends string> {
  value: T
  label: string
}

interface SegmentToggleProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  optionClassName?: string
}

export function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
  className,
  optionClassName,
}: SegmentToggleProps<T>) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-xl bg-surface-subtle p-1', className)}>
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          variant="tag"
          selected={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap',
            opt.value === value && 'shadow-sm',
            optionClassName
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
