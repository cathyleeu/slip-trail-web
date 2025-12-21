import type { ApiErrorOptions, ApiFailure, ApiSuccess } from '@types'
import { NextResponse } from 'next/server'

export function apiError(message: string, options: ApiErrorOptions = {}) {
  const { status = 500, code, details } = options

  return NextResponse.json<ApiFailure>(
    {
      success: false,
      error: message,
      code,
      details,
    },
    { status }
  )
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      data,
    },
    { status }
  )
}
