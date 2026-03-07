'use client'

import { InputField } from '@components'
import { EyeIcon, EyeOffIcon } from '@components/ui'
import { useAuth, useInput } from '@hooks'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { updatePassword } = useAuth()
  const password = useInput({ type: 'password' })
  const confirmPassword = useInput({ type: 'password' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.value.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password.value !== confirmPassword.value) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { success, error } = await updatePassword(password.value)
    setLoading(false)

    if (success) {
      setSuccess(true)
    } else {
      setError(error as string)
    }
  }

  if (success) {
    return (
      <div className="h-full overflow-auto p-4 flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full space-y-6 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Password Reset!</h1>
            <p className="text-gray-600">
              Your password has been successfully updated. You can now log in with your new
              password.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-base shadow-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </motion.button>
        </motion.div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-600">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <InputField label="New Password">
            <InputField.Wrapper>
              <InputField.Input
                value={password.value}
                onChange={password.onChange}
                type={password.type}
                placeholder="Enter new password"
                required
                autoFocus
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

          {/* Confirm Password */}
          <InputField label="Confirm Password">
            <InputField.Wrapper>
              <InputField.Input
                value={confirmPassword.value}
                onChange={confirmPassword.onChange}
                type={confirmPassword.type}
                placeholder="Confirm new password"
                required
              />
              <InputField.Action onClick={confirmPassword.togglePasswordVisibility}>
                {confirmPassword.showPassword ? (
                  <EyeOffIcon className="text-gray-400 w-4 h-4" />
                ) : (
                  <EyeIcon className="text-gray-400 w-4 h-4" />
                )}
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
            disabled={loading || !password.value || !confirmPassword.value}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-base shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
