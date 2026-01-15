'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getPartnerSession } from '@/lib/session'
import { LeadStatus } from '@/types'
import { notifyAdmins } from '@/lib/notifications'
import { NotificationType } from '@/lib/notification-types'
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

export async function createPartnerLead(data: {
  companyName: string
  contactName: string
  email: string
  phone?: string
  phoneCountryCode?: string
  jobTitle?: string
  country: string
  website?: string
  notes?: string
  contacts?: ContactInput[]
  assignToPartnerId?: string  // Optional: assign to an affiliate instead of self
}) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Try to get the user who is creating the lead (if exists in User table)
    // For PARTNER_OWNER, this will be null since they only exist in Partner table
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
    })

    // Get partner to use default commission settings
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        affiliates: {
          select: { id: true },
        },
      },
    })

    if (!partner) {
      return { success: false, error: 'Partner not found' }
    }

    // Determine which partner the lead should be assigned to
    let targetPartnerId = partnerId
    let commissionRate = partner.commissionRate

    // If assignToPartnerId is provided, verify it's a valid affiliate
    if (data.assignToPartnerId && data.assignToPartnerId !== partnerId) {
      const isValidAffiliate = partner.affiliates.some(a => a.id === data.assignToPartnerId)
      if (!isValidAffiliate) {
        return { success: false, error: 'Invalid affiliate' }
      }

      // Get the affiliate's info for commission rate
      const affiliate = await prisma.partner.findUnique({
        where: { id: data.assignToPartnerId },
      })

      if (!affiliate) {
        return { success: false, error: 'Affiliate not found' }
      }

      targetPartnerId = data.assignToPartnerId
      // When assigning to affiliate, use the full partner commission rate
      // (the split will be calculated when processing payments)
      commissionRate = partner.commissionRate
    }

    // Create lead with default commission type matching partner category
    // and the appropriate commission rate
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
        partner: {
          connect: { id: targetPartnerId },
        },
        // Only include createdBy if user exists (omit field entirely if null)
        ...(user && {
          createdBy: {
            connect: { id: user.id },
          },
        }),
        status: LeadStatus.LEAD,
        commissionType: partner.partnerCategory, // Use partner's category
        commissionRate: commissionRate, // Use partner's commission rate
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

    // Notify admins about new lead
    await notifyAdmins(NotificationType.LEAD_CREATED, {
      companyName: lead.companyName,
      partnerName: partner.companyName,
    })

    // Send webhook to Make
    await sendLeadWebhook(WebhookEventType.LEAD_CREATED, {
      id: lead.id,
      companyName: lead.companyName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone || undefined,
      phoneCountryCode: lead.phoneCountryCode || undefined,
      jobTitle: lead.jobTitle || undefined,
      country: lead.country,
      status: lead.status,
      partnerId: partner.id,
      partnerName: partner.companyName,
    })

    revalidatePath('/partner/leads')
    revalidatePath('/partner')
    return { success: true, leadId: lead.id }
  } catch (error) {
    console.error('Error creating lead:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: `Failed to create lead: ${errorMessage}` }
  }
}

export async function updatePartnerLead(
  leadId: string,
  data: {
    companyName: string
    contactName: string
    email: string
    phone?: string
    phoneCountryCode?: string
    jobTitle?: string
    country: string
    website?: string
    notes?: string
    contacts?: ContactInput[]
  }
) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Verify lead belongs to partner
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { contacts: true },
    })

    if (!lead || lead.partnerId !== partnerId) {
      return { success: false, error: 'Lead not found or unauthorized' }
    }

    // Update lead
    await prisma.lead.update({
      where: { id: leadId },
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
      },
    })

    // Handle contacts update
    if (data.contacts !== undefined) {
      const existingContactIds = lead.contacts.map((c) => c.id)
      const newContactIds = data.contacts.filter((c) => c.id).map((c) => c.id!)

      // Delete removed contacts
      const contactsToDelete = existingContactIds.filter((id) => !newContactIds.includes(id))
      if (contactsToDelete.length > 0) {
        await prisma.contact.deleteMany({
          where: { id: { in: contactsToDelete } },
        })
      }

      // Update existing and create new contacts
      for (const contact of data.contacts) {
        if (contact.id) {
          // Update existing contact
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              phoneCountryCode: contact.phoneCountryCode,
              jobTitle: contact.jobTitle,
              isPrimary: contact.isPrimary || false,
            },
          })
        } else {
          // Create new contact
          await prisma.contact.create({
            data: {
              leadId: leadId,
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              phoneCountryCode: contact.phoneCountryCode,
              jobTitle: contact.jobTitle,
              isPrimary: contact.isPrimary || false,
            },
          })
        }
      }
    }

    revalidatePath('/partner/leads')
    revalidatePath(`/partner/leads/${leadId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating lead:', error)
    return { success: false, error: 'Failed to update lead' }
  }
}

export async function deletePartnerLead(leadId: string) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Verify lead belongs to partner
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead || lead.partnerId !== partnerId) {
      return { success: false, error: 'Lead not found or unauthorized' }
    }

    // Only allow deletion if lead hasn't been converted to client
    if (lead.status === LeadStatus.CLIENT) {
      return { success: false, error: 'Cannot delete a client' }
    }

    await prisma.lead.delete({
      where: { id: leadId },
    })

    revalidatePath('/partner/leads')
    revalidatePath('/partner')
    return { success: true }
  } catch (error) {
    console.error('Error deleting lead:', error)
    return { success: false, error: 'Failed to delete lead' }
  }
}

export async function addLeadNote(leadId: string, content: string) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Verify lead belongs to partner
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead || lead.partnerId !== partnerId) {
      return { success: false, error: 'Lead not found or unauthorized' }
    }

    // Try to get the user (if exists in User table)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
    })

    // Get partner name for author
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    })

    const authorName = user?.name || partner?.contactName || session.user.name || 'Partner'

    // Create the note
    await prisma.leadNote.create({
      data: {
        leadId,
        userId: user?.id,
        partnerId: partnerId,
        authorName,
        content,
      },
    })

    revalidatePath(`/partner/leads/${leadId}`)
    return { success: true }
  } catch (error) {
    console.error('Error adding lead note:', error)
    return { success: false, error: 'Failed to add note' }
  }
}
