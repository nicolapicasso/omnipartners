'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PartnerStatus, NotificationType, PartnerCategory } from '@/types'
import { getAdminSession } from '@/lib/session'

export async function approvePartner(partnerId: string) {
  try {
    await getAdminSession() // Verify admin

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        status: PartnerStatus.ACTIVE,
        approvedAt: new Date(),
      },
    })

    // Create notification for partner
    await prisma.notification.create({
      data: {
        partnerId: partner.id,
        type: NotificationType.PARTNER_APPROVED,
        title: '¡Partner Aprobado!',
        message: `Tu solicitud ha sido aprobada. Ya puedes acceder al portal de partners.`,
      },
    })

    // TODO: Send email notification (Hubspot integration)

    revalidatePath('/admin')
    revalidatePath('/admin/partners')
    return { success: true }
  } catch (error) {
    console.error('Error approving partner:', error)
    return { success: false, error: 'Failed to approve partner' }
  }
}

export async function rejectPartner(partnerId: string) {
  try {
    await getAdminSession() // Verify admin

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: { status: PartnerStatus.REJECTED },
    })

    // Create notification for partner
    await prisma.notification.create({
      data: {
        partnerId: partner.id,
        type: NotificationType.PARTNER_REJECTED,
        title: 'Solicitud Rechazada',
        message: `Lamentablemente tu solicitud no ha sido aprobada en este momento.`,
      },
    })

    // TODO: Send email notification (Hubspot integration)

    revalidatePath('/admin')
    revalidatePath('/admin/partners')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting partner:', error)
    return { success: false, error: 'Failed to reject partner' }
  }
}

export async function updatePartnerCategory(partnerId: string, category: PartnerCategory) {
  try {
    await getAdminSession() // Verify admin

    await prisma.partner.update({
      where: { id: partnerId },
      data: { partnerCategory: category },
    })

    revalidatePath('/admin/partners')
    revalidatePath(`/admin/partners/${partnerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating partner category:', error)
    return { success: false, error: 'Failed to update partner category' }
  }
}

export async function suspendPartner(partnerId: string) {
  try {
    await getAdminSession() // Verify admin

    await prisma.partner.update({
      where: { id: partnerId },
      data: { status: PartnerStatus.SUSPENDED },
    })

    revalidatePath('/admin/partners')
    revalidatePath(`/admin/partners/${partnerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error suspending partner:', error)
    return { success: false, error: 'Failed to suspend partner' }
  }
}

export async function activatePartner(partnerId: string) {
  try {
    await getAdminSession() // Verify admin

    await prisma.partner.update({
      where: { id: partnerId },
      data: { status: PartnerStatus.ACTIVE },
    })

    revalidatePath('/admin/partners')
    revalidatePath(`/admin/partners/${partnerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error activating partner:', error)
    return { success: false, error: 'Failed to activate partner' }
  }
}
