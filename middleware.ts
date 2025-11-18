import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

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
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/partner/:path*',
    '/dashboard',
  ],
}
