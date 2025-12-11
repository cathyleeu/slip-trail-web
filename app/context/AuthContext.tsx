'use client'

import { supabaseClient } from '@lib/supabase/client'
import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

export const AuthContext = createContext<{
  user: User | null
  session: Session | null
}>({
  user: null,
  session: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  // 세션 초기 로드
  useEffect(() => {
    supabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        setSession(data.session)
        setUser(data.session?.user ?? null)
      })

    // 로그인/로그아웃 변화 감지
    const { data: listener } = supabaseClient().auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, session }}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}
