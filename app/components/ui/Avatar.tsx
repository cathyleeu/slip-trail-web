'use client'

import { cn } from '@utils/cn'
import Image from 'next/image'
import { Person } from './icons'

type AvatarProps = {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null

  return (
    <div
      className={cn(
        'rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold overflow-hidden shrink-0',
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name || 'Avatar'} fill className="object-cover" />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <Person className={cn(SIZES[size], 'text-gray-300 m-2')} />
      )}
    </div>
  )
}
