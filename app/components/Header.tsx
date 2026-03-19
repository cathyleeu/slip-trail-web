'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeftIcon, IconButton } from './ui'

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
    <div className="sticky top-0 bg-surface border-b border-border h-[58px] px-4 py-3 flex items-center justify-between z-50">
      <div className="flex items-center text-fg flex-1">
        {showBack && (
          <IconButton onClick={handleBack} className="-ml-2 shadow-none">
            <ChevronLeftIcon />
          </IconButton>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </div>
  )
}
