'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getPartnerSession } from '@/lib/session'
import { UserRole, NotificationType } from '@/types'
import bcrypt from 'bcryptjs'
import { sendTeamMemberInvitationEmail } from '@/lib/email'
import { headers } from 'next/headers'

export async function inviteTeamMember(data: {
  name: string
  email: string
  role: UserRole
}) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Verify user is partner owner
    if (session.user.role !== UserRole.PARTNER_OWNER) {
      return { success: false, error: 'Solo el propietario puede invitar miembros' }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, error: 'Este email ya está registrado' }
    }

    // Get partner info for email
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { companyName: true },
    })

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        partnerId,
      },
    })

    // Create notification for new user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.TEAM_MEMBER_ADDED,
        title: 'Bienvenido al equipo',
        message: `Has sido invitado a unirte al equipo. Tu contraseña temporal es: ${tempPassword}`,
      },
    })

    // Send invitation email
    const headersList = await headers()
    const host = headersList.get('host') || 'partners.omniwallet.net'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const loginUrl = `${protocol}://${host}/login`

    const emailResult = await sendTeamMemberInvitationEmail({
      recipientEmail: data.email,
      recipientName: data.name,
      temporaryPassword: tempPassword,
      partnerName: partner?.companyName || 'Partner',
      inviterName: session.user.name || 'Tu equipo',
      loginUrl,
    })

    revalidatePath('/partner/team')
    return { success: true, tempPassword, emailSent: emailResult.success }
  } catch (error) {
    console.error('Error inviting team member:', error)
    return { success: false, error: 'Error al invitar al miembro' }
  }
}

export async function removeTeamMember(userId: string) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Verify user is partner owner
    if (session.user.role !== UserRole.PARTNER_OWNER) {
      return { success: false, error: 'Solo el propietario puede eliminar miembros' }
    }

    // Verify user belongs to partner
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.partnerId !== partnerId) {
      return { success: false, error: 'Miembro no encontrado' }
    }

    // Don't allow removing partner owner
    if (user.role === UserRole.PARTNER_OWNER) {
      return { success: false, error: 'No puedes eliminar al propietario' }
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath('/partner/team')
    return { success: true }
  } catch (error) {
    console.error('Error removing team member:', error)
    return { success: false, error: 'Error al eliminar al miembro' }
  }
}

export async function updateTeamMemberRole(userId: string, role: UserRole) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Verify user is partner owner
    if (session.user.role !== UserRole.PARTNER_OWNER) {
      return { success: false, error: 'Solo el propietario puede cambiar roles' }
    }

    // Verify user belongs to partner
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.partnerId !== partnerId) {
      return { success: false, error: 'Miembro no encontrado' }
    }

    // Don't allow changing partner owner role
    if (user.role === UserRole.PARTNER_OWNER) {
      return { success: false, error: 'No puedes cambiar el rol del propietario' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    revalidatePath('/partner/team')
    return { success: true }
  } catch (error) {
    console.error('Error updating team member role:', error)
    return { success: false, error: 'Error al actualizar el rol' }
  }
}
