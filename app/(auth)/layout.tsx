'use client'

import { cn } from '@utils/cn'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col justify-between">
      <div className={cn('overflow-auto', 'h-screen')}>{children}</div>
    </div>
  )
}
