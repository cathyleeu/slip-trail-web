'use client'

import { InputField } from '@components'
import { Button, EmailIcon, EyeIcon, EyeOffIcon } from '@components/ui'
import { useAuth, useInput } from '@hooks'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const email = useInput({ type: 'email' })
  const password = useInput({ type: 'password' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { success, error } = await login(email.value, password.value)
    setLoading(false)

    if (success) router.push('/')
    else setError(error as string)
  }

  return (
    <div className="h-full overflow-auto px-6 pt-12 pb-8 flex-1 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-10 flex-1"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Welcome back</p>
          <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight">
            Pick up where<br />you left off.
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <InputField label="Email address">
            <InputField.Wrapper>
              <InputField.Input
                value={email.value}
                onChange={email.onChange}
                type={email.type}
                placeholder="name@example.com"
                required
              />
              <InputField.Action>
                <EmailIcon className="text-zinc-400" />
              </InputField.Action>
            </InputField.Wrapper>
          </InputField>

          <div className="space-y-1.5">
            <InputField label="Password">
              <InputField.Wrapper>
                <InputField.Input
                  value={password.value}
                  onChange={password.onChange}
                  type={password.type}
                  placeholder="Enter your password"
                  required
                />
                <InputField.Action onClick={password.togglePasswordVisibility}>
                  {password.showPassword ? (
                    <EyeOffIcon className="text-zinc-400 w-4 h-4" />
                  ) : (
                    <EyeIcon className="text-zinc-400 w-4 h-4" />
                  )}
                </InputField.Action>
              </InputField.Wrapper>
            </InputField>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-zinc-500 hover:text-zinc-900 hover:bg-transparent px-0"
              >
                Forgot password?
              </Button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-semibold text-base shadow-sm hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in…' : 'Log In'}
          </button>
        </form>
      </motion.div>

      {/* Sign Up Link */}
      <div className="pt-8 text-center">
        <p className="text-zinc-500 text-sm">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => router.push('/signup')}
            className="text-zinc-900 font-semibold hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
