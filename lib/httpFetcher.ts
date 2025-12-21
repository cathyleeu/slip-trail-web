export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function readBodySafely(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    try {
      return await res.text()
    } catch {
      return null
    }
  }
}

function extractError(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    return String((body as { error: unknown }).error)
  }
  return 'Request failed'
}

type RequestOptions = RequestInit & {
  /**
   * 내부 API가 apiSuccess({success:true, data:T})로 감싼 경우 자동 unwrap
   */
  unwrapApiSuccess?: boolean
}

/**
 * Unified HTTP fetcher (axios/ky style)
 * - Throws ApiError on failure
 * - Supports apiSuccess/apiError unwrapping for internal APIs
 */
export async function request<T>(input: RequestInfo, options?: RequestOptions): Promise<T> {
  const { unwrapApiSuccess, ...init } = options ?? {}

  try {
    const res = await fetch(input, init)
    const body = await readBodySafely(res)

    // HTTP 에러 (4xx/5xx)
    if (!res.ok) {
      const error = extractError(body)
      const details =
        typeof body === 'object' && body !== null && 'details' in body
          ? (body as { details: unknown }).details
          : body
      throw new ApiError(error, res.status, details)
    }

    // 내부 API unwrap
    if (unwrapApiSuccess && typeof body === 'object' && body !== null && 'success' in body) {
      const apiRes = body as {
        success: boolean
        data?: unknown
        error?: string
        code?: string
        details?: unknown
      }

      if (!apiRes.success) {
        throw new ApiError(
          apiRes.error || 'Request failed',
          res.status,
          apiRes.details,
          apiRes.code
        )
      }

      return apiRes.data as T
    }

    return body as T
  } catch (err) {
    // ApiError는 그대로 전파
    if (err instanceof ApiError) {
      throw err
    }

    // 네트워크 에러 (DNS, timeout 등)
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      0,
      err instanceof Error ? err.stack : String(err)
    )
  }
}
