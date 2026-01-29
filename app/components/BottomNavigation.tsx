'use client'

import { cn } from '@utils/cn'
import { usePathname, useRouter } from 'next/navigation'
import { memo, useCallback } from 'react'

export const BottomNavigation = memo(function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = useCallback((path: string) => pathname === path, [pathname])

  const navigate = useCallback(
    (path: string) => {
      router.push(path)
    },
    [router]
  )

  return (
    <div className="flex justify-around py-2 bg-white border-t border-gray-200">
      <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1">
        <svg
          className={cn('w-6 h-6', isActive('/') ? 'text-blue-500' : 'text-gray-400')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span className={cn('text-xs', isActive('/') ? 'text-blue-500' : 'text-gray-600')}>
          Home
        </span>
      </button>

      <button onClick={() => navigate('/camera')} className="flex flex-col items-center gap-1">
        <svg
          className={cn('w-6 h-6', isActive('/camera') ? 'text-blue-500' : 'text-gray-400')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className={cn('text-xs', isActive('/camera') ? 'text-blue-500' : 'text-gray-600')}>
          Scan
        </span>
      </button>

      <button className="flex flex-col items-center gap-1">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="text-xs text-gray-600">Profile</span>
      </button>
    </div>
  )
})
