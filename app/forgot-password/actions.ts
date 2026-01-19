'use server'

import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { headers } from 'next/headers'
import crypto from 'crypto'

export async function requestPasswordReset(email: string) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[PasswordReset] No user found for email: ${email}`)
      return { success: true }
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() },
    })

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        token,
        email: email.toLowerCase(),
        expiresAt,
      },
    })

    // Build reset URL
    const headersList = await headers()
    const host = headersList.get('host') || 'partners.omniwallet.net'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const resetUrl = `${protocol}://${host}/reset-password?token=${token}`

    // Send email
    const emailResult = await sendPasswordResetEmail({
      recipientEmail: user.email,
      recipientName: user.name,
      resetUrl,
    })

    if (!emailResult.success) {
      console.error('[PasswordReset] Failed to send email:', emailResult.error)
      // Still return success to prevent enumeration
    }

    return { success: true }
  } catch (error) {
    console.error('[PasswordReset] Error:', error)
    return { success: false, error: 'Error al procesar la solicitud' }
  }
}
