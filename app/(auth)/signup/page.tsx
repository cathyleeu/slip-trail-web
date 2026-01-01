'use client'

import { Divider } from '@components/Divider'
import { InputField } from '@components/InputField'
import { AppleIcon, EmailIcon, EyeIcon, EyeOffIcon, GoogleIcon } from '@components/icons'
import { useInput } from '@hooks/useInput'
import { supabaseClient } from '@lib/supabase/client'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const supabase = supabaseClient()
  const router = useRouter()

  const email = useInput({ type: 'email' })
  const password = useInput({ type: 'password' })
  const confirmPassword = useInput({ type: 'password' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.value !== confirmPassword.value) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
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
    <div className="h-full p-4 flex-1 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-600">Sign up to start tracking your receipts and expenses.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Email Input */}
          <InputField label="Email address">
            <InputField.Wrapper>
              <InputField.Input
                type={email.type}
                placeholder="name@example.com"
                value={email.value}
                onChange={email.onChange}
                required
              />
              <InputField.Action>
                <EmailIcon className="text-gray-400" />
              </InputField.Action>
            </InputField.Wrapper>
          </InputField>

          {/* Password Input */}
          <InputField label="Password">
            <InputField.Wrapper>
              <InputField.Input
                type={password.type}
                placeholder="Create a password"
                value={password.value}
                onChange={password.onChange}
                required
              />
              <InputField.Action onClick={password.togglePasswordVisibility}>
                {password.showPassword ? (
                  <EyeOffIcon className="text-gray-400" />
                ) : (
                  <EyeIcon className="text-gray-400" />
                )}
              </InputField.Action>
            </InputField.Wrapper>
          </InputField>

          {/* Confirm Password Input */}
          <InputField label="Confirm password">
            <InputField.Wrapper>
              <InputField.Input
                type={confirmPassword.type}
                placeholder="Confirm your password"
                value={confirmPassword.value}
                onChange={confirmPassword.onChange}
                required
              />
              <InputField.Action onClick={confirmPassword.togglePasswordVisibility}>
                {confirmPassword.showPassword ? (
                  <EyeOffIcon className="text-gray-400" />
                ) : (
                  <EyeIcon className="text-gray-400" />
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
        </form>

        <Divider label="Or continue with" />

        {/* Social Login */}
        <div className="space-y-3">
          <button className="w-full bg-black text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors">
            <AppleIcon />
            Continue with Apple
          </button>
          <button className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            <GoogleIcon />
            Continue with Google
          </button>
        </div>
      </motion.div>
    </div>
  )
}
