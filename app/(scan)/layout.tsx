'use client'

import { Header } from '@components'
import { usePathname } from 'next/navigation'

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideHeaderOnPaths = ['/camera']
  if (hideHeaderOnPaths.includes(pathname)) {
    return <div className="h-screen flex flex-col bg-gray-100">{children}</div>
  }

  const getHeaderTitle = () => {
    if (pathname === '/result') return '영수증 확인'
    if (pathname === '/upload') return '영수증 업로드'
    return 'Slip Trail'
  }

  return (
    <div className="h-screen flex flex-col justify-between bg-gray-100">
      <Header title={getHeaderTitle()} showBack />
      <div className="overflow-auto h-[calc(100vh-57px)]">{children}</div>
    </div>
  )
}
