'use client'

import { Divider, InputField } from '@components'
import { AppleIcon, Button, EmailIcon, EyeIcon, EyeOffIcon, GoogleIcon } from '@components/ui'
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
    <div className="h-full overflow-auto p-4 space-y-4 flex-1 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600">Log in to track your receipts and locations efficiently.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
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
                <EmailIcon className="text-gray-400" />
              </InputField.Action>
            </InputField.Wrapper>
          </InputField>

          {/* Password Input */}
          <div className="space-y-2">
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
                    <EyeOffIcon className="text-gray-400 w-4 h-4" />
                  ) : (
                    <EyeIcon className="text-gray-400 w-4 h-4" />
                  )}
                </InputField.Action>
              </InputField.Wrapper>
            </InputField>
            <div className="flex justify-end">
              <Button
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </Button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm bg-red-50 p-3 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          {/* Login Button */}
          <Button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-base shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        {/* Divider */}
        <Divider label="Or continue with" />
        {/* Social Login */}
        <div className="space-y-3">
          <Button className="w-full bg-black text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors">
            <AppleIcon />
            Continue with Apple
          </Button>
          <Button className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            <GoogleIcon />
            Continue with Google
          </Button>
        </div>
      </motion.div>

      {/* Sign Up Link */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-gray-600">
          Don&apos;t have an account?{' '}
          <Button
            onClick={() => router.push('/signup')}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  )
}
