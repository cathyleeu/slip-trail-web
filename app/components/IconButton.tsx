import React from 'react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'ghost' | 'outline' | 'solid'
  size?: 'sm' | 'md' | 'lg'
}

export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-colors'

  const variantStyles = {
    ghost: 'hover:bg-gray-100 active:bg-gray-200',
    outline: 'border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
    solid: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700',
  }

  const sizeStyles = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
