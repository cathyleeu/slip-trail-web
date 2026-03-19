'use client'

import { cn } from '@utils/cn'
import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef } from 'react'

export type ButtonVariant = 'filled' | 'outlined' | 'ghost' | 'tag'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends HTMLMotionProps<'button'> {
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
      whileTap = undefined,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      filled: 'rounded-lg bg-brand text-white hover:bg-brand-dark disabled:hover:bg-brand',
      outlined:
        'rounded-lg border-2 border-brand text-brand hover:bg-brand-muted disabled:hover:bg-transparent',
      ghost: 'rounded-lg text-brand hover:bg-brand-muted disabled:hover:bg-transparent',
      tag: selected
        ? 'rounded-full bg-brand text-white'
        : 'rounded-full bg-surface-subtle text-fg-soft hover:bg-surface-medium',
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={whileTap}
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
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button
