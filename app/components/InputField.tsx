'use client'

import { cn } from '@utils/cn'
import React from 'react'

// Main wrapper component
interface InputFieldProps {
  label?: string
  error?: string | null
  children: React.ReactNode
  className?: string
}

function InputFieldRoot({ label, error, children, className }: InputFieldProps) {
  const id = React.useId()

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// Input wrapper for positioning icons/actions
interface InputWrapperProps {
  children: React.ReactNode
  className?: string
}

function InputWrapper({ children, className }: InputWrapperProps) {
  return <div className={cn('relative', className)}>{children}</div>
}

function InputElement({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
        className
      )}
      {...props}
    />
  )
}

// Icon/action on the right side
interface InputActionProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

function InputAction({ children, onClick, className }: InputActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('absolute right-4 top-1/2 -translate-y-1/2', className)}
    >
      {children}
    </button>
  )
}

// Export as compound component
export const InputField = Object.assign(InputFieldRoot, {
  Wrapper: InputWrapper,
  Input: InputElement,
  Action: InputAction,
})
