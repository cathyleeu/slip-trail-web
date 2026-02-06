'use client'

import { useAuth } from '@hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // 1. Authorized user to home
    if (user) {
      router.push('/home')
      return
    }

    // 2. unauthorized + has seen onboarding → login page
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (hasSeenOnboarding) {
      router.push('/login')
      return
    }

    // 3.  unauthorized + has not seen onboarding → onboarding
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
