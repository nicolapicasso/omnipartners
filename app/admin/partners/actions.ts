'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PartnerStatus, NotificationType, PartnerCategory } from '@/types'
import { getAdminSession } from '@/lib/session'
import { sendPartnerWebhook } from '@/lib/webhooks'
import { WebhookEventType } from '@/lib/webhook-types'
import { sendAffiliateApprovalEmail } from '@/lib/email'

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

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: { status: PartnerStatus.SUSPENDED },
    })

    // Send webhook for partner suspended event
    await sendPartnerWebhook(WebhookEventType.PARTNER_SUSPENDED, {
      id: partner.id,
      companyName: partner.companyName,
      contactName: partner.contactName,
      email: partner.email,
      phone: partner.phone || undefined,
      country: partner.country,
      status: PartnerStatus.SUSPENDED,
      category: partner.partnerCategory || '',
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

    // First, get the partner to check if it's an affiliate
    const existingPartner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        parentPartner: {
          select: {
            companyName: true,
          },
        },
      },
    })

    if (!existingPartner) {
      return { success: false, error: 'Partner not found' }
    }

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        status: PartnerStatus.ACTIVE,
        approvedAt: new Date(),
      },
    })

    // Send webhook for partner reactivated (using approved event)
    await sendPartnerWebhook(WebhookEventType.PARTNER_APPROVED, {
      id: partner.id,
      companyName: partner.companyName,
      contactName: partner.contactName,
      email: partner.email,
      phone: partner.phone || undefined,
      country: partner.country,
      status: PartnerStatus.ACTIVE,
      category: partner.partnerCategory || '',
    })

    // If this is an affiliate with a temporary password, send approval email
    if (existingPartner.parentPartnerId && existingPartner.temporaryPassword) {
      const loginUrl = process.env.NEXTAUTH_URL || 'https://partners.omniwallet.com'

      await sendAffiliateApprovalEmail({
        recipientEmail: partner.email,
        recipientName: partner.contactName,
        companyName: partner.companyName,
        temporaryPassword: existingPartner.temporaryPassword,
        parentPartnerName: existingPartner.parentPartner?.companyName || 'Omniwallet Partners',
        loginUrl: `${loginUrl}/login`,
      })

      console.log(`[Admin] Affiliate approval email sent to ${partner.email}`)
    }

    revalidatePath('/admin/partners')
    revalidatePath(`/admin/partners/${partnerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error activating partner:', error)
    return { success: false, error: 'Failed to activate partner' }
  }
}

export async function updatePartnerContract(partnerId: string, contractUrl: string) {
  try {
    await getAdminSession() // Verify admin

    await prisma.partner.update({
      where: { id: partnerId },
      data: { contractUrl: contractUrl || null },
    })

    revalidatePath('/admin/partners')
    revalidatePath(`/admin/partners/${partnerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating partner contract:', error)
    return { success: false, error: 'Failed to update contract' }
  }
}

export async function updatePartnerOmniwalletAccount(partnerId: string, accountUrl: string) {
  try {
    await getAdminSession() // Verify admin

    await prisma.partner.update({
      where: { id: partnerId },
      data: { omniwalletAccountUrl: accountUrl || null },
    })

    revalidatePath('/admin/partners')
    revalidatePath(`/admin/partners/${partnerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating partner Omniwallet account:', error)
    return { success: false, error: 'Failed to update Omniwallet account' }
  }
}

export async function updatePartnerYearlyEvent(partnerId: string, hasCompletedYearlyEvent: boolean) {
  try {
    await getAdminSession() // Verify admin

    await prisma.partner.update({
      where: { id: partnerId },
      data: { hasCompletedYearlyEvent },
    })

    revalidatePath('/admin/partners')
    revalidatePath(`/admin/partners/${partnerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating partner yearly event:', error)
    return { success: false, error: 'Failed to update yearly event status' }
  }
}

export async function updatePartnerCanHaveAffiliates(partnerId: string, canHaveAffiliates: boolean) {
  try {
    await getAdminSession() // Verify admin

    await prisma.partner.update({
      where: { id: partnerId },
      data: { canHaveAffiliates },
    })

    revalidatePath('/admin/partners')
    revalidatePath(`/admin/partners/${partnerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating partner canHaveAffiliates:', error)
    return { success: false, error: 'Failed to update affiliate permission' }
  }
}

export async function updatePartnerCommissionRate(partnerId: string, commissionRate: number) {
  try {
    await getAdminSession() // Verify admin

    if (commissionRate < 0 || commissionRate > 100) {
      return { success: false, error: 'Commission rate must be between 0 and 100' }
    }

    await prisma.partner.update({
      where: { id: partnerId },
      data: { commissionRate },
    })

    revalidatePath('/admin/partners')
    revalidatePath(`/admin/partners/${partnerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating partner commission rate:', error)
    return { success: false, error: 'Failed to update commission rate' }
  }
}
