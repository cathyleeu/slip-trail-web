'use client'

import { Divider } from '@components/Divider'
import { InputField } from '@components/InputField'
import { AppleIcon, EmailIcon, EyeIcon, EyeOffIcon, GoogleIcon, Toast, useToast } from '@components/ui'
import { useAuth, useInput } from '@hooks'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function getPasswordChecks(password: string) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
  ]
}

function PasswordStrength({ password }: { password: string }) {
  const checks = getPasswordChecks(password)
  const score = checks.filter(Boolean).length

  const bars = [
    score >= 1 ? (score === 1 ? 'bg-red-400' : score === 2 ? 'bg-amber-400' : 'bg-green-400') : 'bg-zinc-200',
    score >= 2 ? (score === 2 ? 'bg-amber-400' : 'bg-green-400') : 'bg-zinc-200',
    score >= 3 ? (score === 3 ? 'bg-green-400' : 'bg-green-400') : 'bg-zinc-200',
    score >= 4 ? 'bg-green-400' : 'bg-zinc-200',
  ]

  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score]
  const labelColor = ['', 'text-red-500', 'text-amber-500', 'text-green-500', 'text-green-600'][score]

  if (!password) return null

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {bars.map((cls, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${cls}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400">8+ chars · uppercase · lowercase · number</p>
        {label && <p className={`text-xs font-medium ${labelColor}`}>{label}</p>}
      </div>
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const { signup } = useAuth()

  const email = useInput({ type: 'email' })
  const password = useInput({ type: 'password' })
  const confirmPassword = useInput({ type: 'password' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toastState, showToast } = useToast()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!getPasswordChecks(password.value).every(Boolean)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and numbers')
      setLoading(false)
      return
    }

    if (password.value !== confirmPassword.value) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error } = await signup(email.value, password.value)

    setLoading(false)

    if (error) {
      setError(error)
    } else {
      showToast('Check your email for a confirmation link!', 'success')
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <>
    <div className="h-full px-6 pt-12 pb-8 flex-1 flex flex-col overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-10"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Start your trail</p>
          <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight">
            Create your<br />account.
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-5">
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
                <EmailIcon className="text-zinc-400" />
              </InputField.Action>
            </InputField.Wrapper>
          </InputField>

          <div>
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
                    <EyeOffIcon className="text-zinc-400 w-4 h-4" />
                  ) : (
                    <EyeIcon className="text-zinc-400 w-4 h-4" />
                  )}
                </InputField.Action>
              </InputField.Wrapper>
            </InputField>
            <PasswordStrength password={password.value} />
          </div>

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
                  <EyeOffIcon className="text-zinc-400 w-4 h-4" />
                ) : (
                  <EyeIcon className="text-zinc-400 w-4 h-4" />
                )}
              </InputField.Action>
            </InputField.Wrapper>
          </InputField>

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
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-semibold text-base shadow-sm hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <Divider label="Or continue with" />

        {/* Social Login */}
        <div className="space-y-3">
          <button className="w-full bg-zinc-900 text-white py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2.5 hover:bg-zinc-800 active:scale-[0.98] transition-all">
            <AppleIcon />
            Continue with Apple
          </button>
          <button className="w-full bg-white border border-zinc-200 text-zinc-900 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2.5 hover:bg-zinc-50 active:scale-[0.98] transition-all">
            <GoogleIcon />
            Continue with Google
          </button>
        </div>
      </motion.div>

      <div className="pt-8 text-center">
        <p className="text-zinc-500 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-zinc-900 font-semibold hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
    <Toast
      visible={!!toastState}
      message={toastState?.message ?? ''}
      type={toastState?.type ?? 'success'}
    />
    </>
  )
}
