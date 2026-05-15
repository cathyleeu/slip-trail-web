import { cn } from '@utils'
import type { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function Card({ children, className, style }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface shadow-[0_2px_16px_rgba(0,0,0,0.06)]',
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-2', className)}>
      <div className="text-sm font-semibold text-fg">{title}</div>
      {subtitle && <div className="text-xs text-fg-subtle">{subtitle}</div>}
      {action}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-4', className)}>{children}</div>
}
