import type { SupabaseClient, User } from '@supabase/supabase-js'
import { apiError } from './apiResponse'
import { requireAuth } from './auth'
import { supabaseServer } from './supabase/server'

// ============ Types ============

type AuthenticatedContext = {
  user: User
  supabase: SupabaseClient
}

type ApiHandlerOptions = {
  requireAuthentication?: boolean
}

/**
 * Authenticated API handler type
 */
export type AuthenticatedHandler<T = unknown> = (
  req: Request,
  context: AuthenticatedContext
) => Promise<Response> | Response

/**
 * Unauthenticated API handler type
 */
export type UnauthenticatedHandler = (req: Request) => Promise<Response> | Response

// ============ Error Handler ============

/**
 * Standardized error handler for API routes
 */
function handleApiError(error: unknown): Response {
  // Already a Response (e.g., from requireAuth)
  if (error instanceof Response) {
    return error
  }

  // Known error types
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', { status: 401 })
    }

    // Generic error with message
    return apiError('Unexpected error', {
      status: 500,
      details: error.message,
    })
  }

  // Unknown error type
  return apiError('Unexpected error', {
    status: 500,
    details: String(error),
  })
}

// ============ Handler Wrappers ============

/**
 * Wraps an API handler with authentication and standardized error handling
 *
 * @example
 * export const GET = withAuth(async (req, { user, supabase }) => {
 *   const { data } = await supabase.from('table').select().eq('user_id', user.id)
 *   return apiSuccess(data)
 * })
 */
export function withAuth(handler: AuthenticatedHandler): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      const supabase = await supabaseServer()
      const auth = await requireAuth(supabase)

      if (!auth.ok) {
        return auth.response
      }

      return await handler(req, { user: auth.user, supabase })
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Wraps an API handler with standardized error handling only (no auth)
 *
 * @example
 * export const POST = withErrorHandler(async (req) => {
 *   const body = await req.json()
 *   // ... process request
 *   return apiSuccess(result)
 * })
 */
export function withErrorHandler(
  handler: UnauthenticatedHandler
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      return await handler(req)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Generic API handler wrapper with options
 * Combines authentication and error handling based on options
 *
 * @example
 * export const GET = apiHandler(async (req, context) => {
 *   if (context.user) {
 *     // Authenticated request
 *   }
 *   return apiSuccess(data)
 * }, { requireAuthentication: true })
 */
export function apiHandler(
  handler: AuthenticatedHandler | UnauthenticatedHandler,
  options: ApiHandlerOptions = {}
): (req: Request) => Promise<Response> {
  const { requireAuthentication = false } = options

  if (requireAuthentication) {
    return withAuth(handler as AuthenticatedHandler)
  }

  return withErrorHandler(handler as UnauthenticatedHandler)
}
