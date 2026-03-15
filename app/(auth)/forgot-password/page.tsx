'use client'

import { Header, InputField } from '@components'
import { Button, EmailIcon } from '@components/ui'
import { useAuth, useInput } from '@hooks'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const email = useInput({ type: 'email' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { success, error } = await resetPassword(email.value)
    setLoading(false)

    if (success) {
      setSent(true)
    } else {
      setError(error as string)
    }
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-4 flex-1 flex flex-col">
      <Header title="" showBack />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
              <p className="text-gray-600 text-sm">
                We sent a password reset link to
                <br />
                <span className="font-medium text-gray-900">{email.value}</span>
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full py-4 rounded-2xl font-semibold"
              >
                Back to Login
              </Button>
              <button
                onClick={() => {
                  setSent(false)
                  setError(null)
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Didn&apos;t receive the email? Try again
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <InputField label="Email address">
              <InputField.Wrapper>
                <InputField.Input
                  value={email.value}
                  onChange={email.onChange}
                  type={email.type}
                  placeholder="name@example.com"
                  required
                  autoFocus
                />
                <InputField.Action>
                  <EmailIcon className="text-gray-400" />
                </InputField.Action>
              </InputField.Wrapper>
            </InputField>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm bg-red-50 p-3 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading || !email.value}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-base shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </motion.button>
          </form>
        )}
      </motion.div>

      {/* Back to Login Link */}
      {!sent && (
        <div className="mt-auto pt-8 text-center">
          <p className="text-gray-600">
            Remember your password?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
