import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token'
  })

  const path = req.nextUrl.pathname

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  // Admin only routes
  if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // Partner routes (PARTNER_OWNER and PARTNER_USER)
  if (path.startsWith('/partner')) {
    const allowedRoles = ['PARTNER_OWNER', 'PARTNER_USER']
    if (!token?.role || !allowedRoles.includes(token.role as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Redirect to appropriate dashboard after login
  if (path === '/dashboard') {
    if (token?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    if (token?.role === 'PARTNER_OWNER' || token?.role === 'PARTNER_USER') {
      return NextResponse.redirect(new URL('/partner', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/partner/:path*',
    '/dashboard',
  ],
}
