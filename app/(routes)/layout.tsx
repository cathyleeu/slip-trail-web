'use client'

import { BottomNavigation, Header } from '@components'
import { usePathname } from 'next/navigation'

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const getHeaderTitle = () => {
    if (pathname === '/map') return 'Slip Trail'
    if (pathname === '/dashboard') return '대시보드'
    return 'Slip Trail'
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={getHeaderTitle()} showBack={pathname !== '/map'} />
      <div className="flex-1 overflow-auto">{children}</div>
      <BottomNavigation />
    </div>
  )
}
