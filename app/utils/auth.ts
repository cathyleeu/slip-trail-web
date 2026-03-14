import type { AuthErrorType } from '@types'

const AUTH_ERROR_MESSAGES = new Map([
  ['Invalid login credentials', '이메일 또는 비밀번호가 틀렸습니다'],
  ['User already registered', '이미 가입된 이메일입니다'],
  ['Email rate limit exceeded', '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요'],
  ['Email not confirmed', '이메일 인증이 완료되지 않았습니다'],
  ['Password should be at least', '비밀번호는 최소 8자 이상이어야 합니다'],
  ['Password should contain', '비밀번호는 소문자, 대문자, 숫자를 모두 포함해야 합니다'],
  ['weak_password', '비밀번호는 소문자, 대문자, 숫자를 모두 포함해야 합니다'],
])

const parseAuthError = (error: AuthErrorType): string => {
  const message = error instanceof Error ? error.message : String(error)

  for (const [key, value] of AUTH_ERROR_MESSAGES) {
    if (message.includes(key)) return value
  }

  return '오류가 발생했습니다. 다시 시도해주세요'
}

export { parseAuthError }
