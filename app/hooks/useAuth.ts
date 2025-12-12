'use client'
import { useAuthContext } from '@context/AuthContext'
import { supabaseClient } from '@lib/supabase/client'

export function useAuth() {
  const { user, session, loading } = useAuthContext()
  const supabase = supabaseClient()

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  async function signup(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  if (!user && !session && loading === undefined)
    throw new Error('useAuth must be used within AuthProvider')
  return { user, session, loading, login, signup, logout }
}
