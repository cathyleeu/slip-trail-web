'use client'

import { cn } from '@utils/cn'
import Image from 'next/image'
import { Person } from './icons'

type AvatarSize = 'sm' | 'md' | 'lg'

type AvatarProps = {
  src?: string | null
  name?: string | null
  size?: AvatarSize
  className?: string
}

const ICON_SIZES: Record<AvatarSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const CONTAINER_SIZES: Record<AvatarSize, string> = {
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
    : null

  return (
    <div
      className={cn(
        'rounded-full bg-fg flex items-center justify-center text-surface font-semibold overflow-hidden shrink-0',
        CONTAINER_SIZES[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name || 'Avatar'} fill className="object-cover" />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <Person className={cn(ICON_SIZES[size], 'text-fg-subtle m-2')} />
      )}
    </div>
  )
}
