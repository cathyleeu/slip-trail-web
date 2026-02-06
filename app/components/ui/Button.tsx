'use client'

import { cn } from '@utils/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export type ButtonVariant = 'filled' | 'outlined' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'filled', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseStyles =
      'font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      filled: 'bg-blue-500 text-white hover:bg-blue-600 disabled:hover:bg-blue-500',
      outlined:
        'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 disabled:hover:bg-transparent',
      ghost: 'text-blue-500 hover:bg-blue-50 disabled:hover:bg-transparent',
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
