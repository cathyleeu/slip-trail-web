'use client'

import { useRouter } from 'next/navigation'

type HeaderProps = {
  title: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
}

export function Header({ title, showBack = true, onBack, rightAction }: HeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) onBack()
    else router.back()
  }

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 h-[58px] px-4 py-3 flex items-center justify-between z-50">
      <div className="flex items-center text-cyan-950 flex-1">
        {showBack && (
          <button onClick={handleBack} className="mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </div>
  )
}
