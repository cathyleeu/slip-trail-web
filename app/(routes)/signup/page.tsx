'use client'

import { supabaseClient } from '@lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const supabase = supabaseClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      alert('Check your email for confirmation!')
      router.push('/login')
    }
  }

  return (
    <form onSubmit={handleSignUp} className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Sign up</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button disabled={loading} className="w-full bg-black text-white p-2">
        {loading ? 'Signing up...' : 'Sign up'}
      </button>
    </form>
  )
}
