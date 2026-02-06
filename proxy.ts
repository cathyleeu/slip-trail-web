import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/map', '/camera', '/dashboard', '/account']
const AUTH_PAGES = ['/upload', '/login', '/signup']

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl
  const isAuthed = !!user

  // Root: go to the right starting page.
  if (pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = isAuthed ? '/home' : '/onboarding'
    return NextResponse.redirect(url)
  }

  // If already logged in, keep them out of auth pages.
  if (isAuthed && isAuthPage(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  // If not logged in, protect app pages.
  if (!isAuthed && isProtectedPath(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/map/:path*',
    '/camera/:path*',
    '/dashboard/:path*',
    '/account/:path*',
  ],
}
