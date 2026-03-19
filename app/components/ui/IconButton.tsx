'use client'

import { cn } from '@utils/cn'
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

export type IconButtonVariant = 'filled' | 'outlined' | 'ghost'
export type IconButtonSize = 'sm' | 'md' | 'lg'
export type IconButtonShape = 'circle' | 'rounded' | 'square'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  shape?: IconButtonShape
  children: ReactNode
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'filled', size = 'md', shape = 'circle', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      filled: 'bg-surface text-fg-soft hover:bg-surface-raised shadow-lg disabled:hover:bg-surface',
      outlined:
        'border-2 border-border-strong text-fg-soft hover:bg-surface-raised disabled:hover:bg-transparent',
      ghost: 'text-fg-soft hover:bg-surface-subtle disabled:hover:bg-transparent',
    }

    const sizeStyles = {
      sm: 'p-2 w-8 h-8',
      md: 'p-3 w-12 h-12',
      lg: 'p-4 w-14 h-14',
    }

    const shapeStyles = {
      circle: 'rounded-full',
      rounded: 'rounded-xl',
      square: 'rounded-none',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          shapeStyles[shape],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton
