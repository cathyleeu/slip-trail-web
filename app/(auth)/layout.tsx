'use client'

import { Header } from '@components'
import { cn } from '@utils/cn'
import { usePathname } from 'next/navigation'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isHideHeader = pathname === '/onboarding'
  return (
    <div className="h-screen flex flex-col justify-between">
      {!isHideHeader && <Header title={''} showBack />}
      <div className={cn('overflow-auto', isHideHeader ? 'h-screen' : 'h-[calc(100vh-57px)]')}>
        {children}
      </div>
    </div>
  )
}
