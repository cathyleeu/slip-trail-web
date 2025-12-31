'use client'

import { useAuth } from '@hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // 1. 로그인된 사용자 → 메인 화면
    if (user) {
      router.push('/map')
      return
    }

    // 2. 비로그인 + 온보딩 봤음 → 로그인 페이지
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (hasSeenOnboarding) {
      router.push('/login')
      return
    }

    // 3. 비로그인 + 온보딩 안봤음 → 온보딩
    router.push('/onboarding')
  }, [user, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
