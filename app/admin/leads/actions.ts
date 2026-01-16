'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAdminSession } from '@/lib/session'
import { LeadStatus, CommissionType, NotificationType } from '@/types'
import { notifyPartnerUsers } from '@/lib/notifications'
import { NotificationType as NotifType } from '@/lib/notification-types'
import { sendLeadWebhook } from '@/lib/webhooks'
import { WebhookEventType } from '@/lib/webhook-types'

interface ContactInput {
  id?: string
  name: string
  email: string
  phone?: string
  phoneCountryCode?: string
  jobTitle?: string
  isPrimary?: boolean
}

export async function createLead(data: {
  companyName: string
  contactName: string
  email: string
  phone?: string
  phoneCountryCode?: string
  jobTitle?: string
  country: string
  website?: string
  notes?: string
  partnerId: string
  commissionType: CommissionType
  commissionRate: number
  contacts?: ContactInput[]
}) {
  try {
    const session = await getAdminSession() // Verify admin

    // Create a default admin user to assign as creator
    let adminUser = await prisma.user.findFirst({
      where: { email: session.user.email },
    })

    if (!adminUser) {
      // If admin doesn't exist in User table, get any admin
      adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      })
    }

    if (!adminUser) {
      return { success: false, error: 'Admin user not found' }
    }

    const lead = await prisma.lead.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        phoneCountryCode: data.phoneCountryCode,
        jobTitle: data.jobTitle,
        country: data.country,
        website: data.website,
        notes: data.notes,
        partnerId: data.partnerId,
        createdById: adminUser.id,
        commissionType: data.commissionType,
        commissionRate: data.commissionRate,
        status: LeadStatus.LEAD,
        // Create contacts if provided
        ...(data.contacts &&
          data.contacts.length > 0 && {
            contacts: {
              create: data.contacts.map((contact) => ({
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                phoneCountryCode: contact.phoneCountryCode,
                jobTitle: contact.jobTitle,
                isPrimary: contact.isPrimary || false,
              })),
            },
          }),
      },
    })

    // Notify partner
    await prisma.notification.create({
      data: {
        partnerId: data.partnerId,
        type: NotificationType.NEW_LEAD,
        title: 'Nuevo Lead Asignado',
        message: `Se te ha asignado un nuevo lead: ${data.companyName}`,
      },
    })

    revalidatePath('/admin/leads')
    revalidatePath('/admin/partners')
    return { success: true, leadId: lead.id }
  } catch (error) {
    console.error('Error creating lead:', error)
    return { success: false, error: 'Failed to create lead' }
  }
}

export async function updateLeadCommission(
  leadId: string,
  commissionType: CommissionType,
  commissionRate: number
) {
  try {
    await getAdminSession() // Verify admin

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        commissionType,
        commissionRate,
      },
    })

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating lead commission:', error)
    return { success: false, error: 'Failed to update lead commission' }
  }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  try {
    await getAdminSession() // Verify admin

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { partner: true },
    })

    if (!lead) {
      return { success: false, error: 'Lead not found' }
    }

    const updateData: any = { status }

    if (status === LeadStatus.CLIENT && !lead.convertedAt) {
      updateData.convertedAt = new Date()

      // Notify partner users of conversion
      await notifyPartnerUsers(lead.partnerId, NotifType.LEAD_TO_CLIENT, {
        companyName: lead.companyName,
      })

      // Send webhook for client conversion
      await sendLeadWebhook(WebhookEventType.LEAD_TO_CLIENT, {
        id: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone || undefined,
        phoneCountryCode: lead.phoneCountryCode || undefined,
        jobTitle: lead.jobTitle || undefined,
        country: lead.country,
        status: LeadStatus.CLIENT,
        partnerId: lead.partnerId,
        partnerName: lead.partner.companyName,
      })
    }

    if (status === LeadStatus.PROSPECT && lead.status === LeadStatus.LEAD) {
      // Notify partner users of prospect conversion
      await notifyPartnerUsers(lead.partnerId, NotifType.LEAD_TO_PROSPECT, {
        companyName: lead.companyName,
      })

      // Send webhook for prospect conversion
      await sendLeadWebhook(WebhookEventType.LEAD_TO_PROSPECT, {
        id: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone || undefined,
        phoneCountryCode: lead.phoneCountryCode || undefined,
        jobTitle: lead.jobTitle || undefined,
        country: lead.country,
        status: LeadStatus.PROSPECT,
        partnerId: lead.partnerId,
        partnerName: lead.partner.companyName,
      })
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
    })

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating lead status:', error)
    return { success: false, error: 'Failed to update lead status' }
  }
}

export async function reassignLead(leadId: string, newPartnerId: string) {
  try {
    await getAdminSession() // Verify admin

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        partnerId: newPartnerId,
        assignedAt: new Date(),
      },
    })

    // Notify new partner
    await prisma.notification.create({
      data: {
        partnerId: newPartnerId,
        type: NotificationType.NEW_LEAD,
        title: 'Lead Reasignado',
        message: `Se te ha reasignado el lead: ${lead.companyName}`,
      },
    })

    revalidatePath('/admin/leads')
    revalidatePath('/admin/partners')
    return { success: true }
  } catch (error) {
    console.error('Error reassigning lead:', error)
    return { success: false, error: 'Failed to reassign lead' }
  }
}

export async function archiveLead(leadId: string) {
  try {
    await getAdminSession() // Verify admin

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: LeadStatus.ARCHIVED },
    })

    console.log(`[Admin] Lead archived: ${lead.companyName} (${leadId})`)

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true }
  } catch (error) {
    console.error('Error archiving lead:', error)
    return { success: false, error: 'Failed to archive lead' }
  }
}

export async function unarchiveLead(leadId: string) {
  try {
    await getAdminSession() // Verify admin

    // Restore to LEAD status
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: LeadStatus.LEAD },
    })

    console.log(`[Admin] Lead unarchived: ${lead.companyName} (${leadId})`)

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true }
  } catch (error) {
    console.error('Error unarchiving lead:', error)
    return { success: false, error: 'Failed to unarchive lead' }
  }
}

export async function deleteLead(leadId: string) {
  try {
    await getAdminSession() // Verify admin

    // Get lead info before deletion
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        _count: {
          select: { payments: true },
        },
      },
    })

    if (!lead) {
      return { success: false, error: 'Lead not found' }
    }

    // Check if lead has payments - cannot delete
    if (lead._count.payments > 0) {
      return {
        success: false,
        error: `No se puede eliminar el lead porque tiene ${lead._count.payments} pago(s) registrado(s). Considera archivarlo en su lugar.`,
      }
    }

    // Delete the lead (cascade will handle related records like notes, contacts)
    await prisma.lead.delete({
      where: { id: leadId },
    })

    console.log(`[Admin] Lead deleted: ${lead.companyName} (${leadId})`)

    revalidatePath('/admin/leads')
    return { success: true, redirect: '/admin/leads' }
  } catch (error) {
    console.error('Error deleting lead:', error)
    return { success: false, error: 'Failed to delete lead' }
  }
}
