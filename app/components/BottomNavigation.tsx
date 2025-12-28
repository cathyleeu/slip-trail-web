'use client'

import { usePathname, useRouter } from 'next/navigation'

export function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex justify-around py-2 bg-white border-t border-gray-200">
      <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1">
        <svg
          className={`w-6 h-6 ${isActive('/') ? 'text-blue-500' : 'text-gray-400'}`}
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
        <span className={`text-xs ${isActive('/') ? 'text-blue-500' : 'text-gray-600'}`}>Home</span>
      </button>

      <button onClick={() => router.push('/camera')} className="flex flex-col items-center gap-1">
        <svg
          className={`w-6 h-6 ${isActive('/camera') ? 'text-blue-500' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className={`text-xs ${isActive('/camera') ? 'text-blue-500' : 'text-gray-600'}`}>
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
}
