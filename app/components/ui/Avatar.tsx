'use client'

import { cn } from '@utils/cn'
import Image from 'next/image'

type AvatarProps = {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div
      className={cn(
        'rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden shrink-0',
        SIZES[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name || 'Avatar'} fill className="object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
