import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { redirect } from 'next/navigation'
import { UserRole } from '@/types'

/**
 * Get the current session
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current session or redirect to login
 */
export async function getRequiredSession() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

/**
 * Get the current session and verify admin role
 */
export async function getAdminSession() {
  const session = await getRequiredSession()

  if (session.user.role !== UserRole.ADMIN) {
    redirect('/unauthorized')
  }

  return session
}

/**
 * Get the current session and verify partner role
 */
export async function getPartnerSession() {
  const session = await getRequiredSession()

  const allowedRoles = [UserRole.PARTNER_OWNER, UserRole.PARTNER_USER]
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized')
  }

  return session
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const session = await getSession()
  return session?.user.role === UserRole.ADMIN
}

/**
 * Check if user is partner owner
 */
export async function isPartnerOwner() {
  const session = await getSession()
  return session?.user.role === UserRole.PARTNER_OWNER
}

/**
 * Check if user is partner (owner or user)
 */
export async function isPartner() {
  const session = await getSession()
  const allowedRoles = [UserRole.PARTNER_OWNER, UserRole.PARTNER_USER]
  return session ? allowedRoles.includes(session.user.role) : false
}
