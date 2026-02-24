'use client'

import { cn } from '@utils/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export type ButtonVariant = 'filled' | 'outlined' | 'ghost' | 'tag'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  selected?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'filled',
      size = 'md',
      fullWidth = false,
      selected = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      filled: 'rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:hover:bg-blue-500',
      outlined:
        'rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50 disabled:hover:bg-transparent',
      ghost: 'rounded-lg text-blue-500 hover:bg-blue-50 disabled:hover:bg-transparent',
      tag: selected
        ? 'rounded-full bg-blue-600 text-white'
        : 'rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200',
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
