'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function validateResetToken(token: string) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return { valid: false }
    }

    if (resetToken.used) {
      return { valid: false }
    }

    if (new Date() > resetToken.expiresAt) {
      return { valid: false }
    }

    return { valid: true }
  } catch (error) {
    console.error('[ValidateResetToken] Error:', error)
    return { valid: false }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Find and validate token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return { success: false, error: 'Enlace no válido' }
    }

    if (resetToken.used) {
      return { success: false, error: 'Este enlace ya ha sido utilizado' }
    }

    if (new Date() > resetToken.expiresAt) {
      return { success: false, error: 'El enlace ha expirado' }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    return { success: true }
  } catch (error) {
    console.error('[ResetPassword] Error:', error)
    return { success: false, error: 'Error al restablecer la contraseña' }
  }
}
