import type { AuthErrorType } from '@types'

const AUTH_ERROR_MESSAGES = new Map([
  ['Invalid login credentials', 'Incorrect email or password'],
  ['User already registered', 'An account with this email already exists'],
  ['Email rate limit exceeded', 'Too many attempts. Please try again later'],
  ['Email not confirmed', 'Please verify your email before continuing'],
  ['Password should be at least', 'Password must be at least 8 characters'],
  ['Password should contain', 'Password must include lowercase, uppercase, and numbers'],
  ['weak_password', 'Password must include lowercase, uppercase, and numbers'],
])

const parseAuthError = (error: AuthErrorType): string => {
  const message = error instanceof Error ? error.message : String(error)

  for (const [key, value] of AUTH_ERROR_MESSAGES) {
    if (message.includes(key)) return value
  }

  return 'Something went wrong. Please try again'
}

export { parseAuthError }
