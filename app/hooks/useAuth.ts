import { useAuthContext } from '@context/AuthContext'

export function useAuth() {
  const ctx = useAuthContext()
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
