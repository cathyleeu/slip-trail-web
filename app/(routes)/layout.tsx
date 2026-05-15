'use client'

import BottomNav from '@components/BottomNav'

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 overflow-auto pb-[58px]">{children}</div>
      <BottomNav />
    </div>
  )
}
