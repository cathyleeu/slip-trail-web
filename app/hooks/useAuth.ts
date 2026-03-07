'use client'
import { useAuthContext } from '@context/AuthContext'
import { supabaseClient } from '@lib/supabase/client'
import { AuthErrorType, AuthResult } from '@types'
import { parseAuthError } from '@utils/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { user, session, loading } = useAuthContext()
  const supabase = supabaseClient()
  const router = useRouter()

  function handleResult(error?: AuthErrorType) {
    if (error) {
      return {
        success: false,
        error: parseAuthError(error), // "Invalid credentials" → "이메일 또는 비밀번호 오류"
      }
    }
    return { success: true, error: null }
  }
  async function login(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return handleResult(error)
  }

  async function signup(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return handleResult(error)
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    router.push('/login')
    if (error) throw error
  }

  async function resetPassword(email: string): Promise<AuthResult> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return handleResult(error)
  }

  async function updatePassword(newPassword: string): Promise<AuthResult> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return handleResult(error)
  }

  if (!user && !session && loading === undefined)
    throw new Error('useAuth must be used within AuthProvider')
  return { user, session, loading, login, signup, logout, resetPassword, updatePassword }
}
