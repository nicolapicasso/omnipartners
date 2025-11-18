'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getPartnerSession } from '@/lib/session'
import { LeadStatus } from '@/types'

export async function createPartnerLead(data: {
  companyName: string
  contactName: string
  email: string
  phone?: string
  country: string
  website?: string
  notes?: string
}) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Get the user who is creating the lead
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Get partner to use default commission settings
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    })

    if (!partner) {
      return { success: false, error: 'Partner not found' }
    }

    // Create lead with default commission type matching partner category
    // and a default rate (can be adjusted by admin later)
    const lead = await prisma.lead.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        website: data.website,
        notes: data.notes,
        partnerId,
        createdById: user.id,
        status: LeadStatus.LEAD,
        commissionType: partner.partnerCategory, // Use partner's category
        commissionRate: 10, // Default rate, admin can adjust
      },
    })

    revalidatePath('/partner/leads')
    revalidatePath('/partner')
    return { success: true, leadId: lead.id }
  } catch (error) {
    console.error('Error creating lead:', error)
    return { success: false, error: 'Failed to create lead' }
  }
}

export async function updatePartnerLead(
  leadId: string,
  data: {
    companyName: string
    contactName: string
    email: string
    phone?: string
    country: string
    website?: string
    notes?: string
  }
) {
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

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        website: data.website,
        notes: data.notes,
      },
    })

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
