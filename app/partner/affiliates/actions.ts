'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getPartnerSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// Generate a random password
function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function createAffiliate(data: {
  companyName: string
  contactName: string
  email: string
  phone?: string
  country: string
  commission: number
  parentPartnerId: string
}) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Verify that the current partner is the parent
    if (partnerId !== data.parentPartnerId) {
      return { success: false, error: 'No tienes permiso para crear afiliados' }
    }

    // Get parent partner to verify commission
    const parentPartner = await prisma.partner.findUnique({
      where: { id: partnerId },
    })

    if (!parentPartner) {
      return { success: false, error: 'Partner no encontrado' }
    }

    if (!parentPartner.canHaveAffiliates) {
      return { success: false, error: 'No tienes permiso para crear afiliados' }
    }

    // Verify commission is within limits
    const parentCommission = parentPartner.commissionRate || 0
    if (data.commission > parentCommission) {
      return {
        success: false,
        error: `La comisión no puede ser mayor que tu comisión base (${parentCommission}%)`,
      }
    }

    // Check if email already exists
    const existingPartner = await prisma.partner.findUnique({
      where: { email: data.email },
    })

    if (existingPartner) {
      return { success: false, error: 'Ya existe un partner con este email' }
    }

    // Generate password
    const tempPassword = generatePassword()
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Create affiliate partner (status: PENDING for admin approval)
    const affiliate = await prisma.partner.create({
      data: {
        email: data.email,
        password: hashedPassword,
        companyName: data.companyName,
        contactName: data.contactName,
        phone: data.phone || null,
        country: data.country,
        status: 'PENDING',
        partnerCategory: parentPartner.partnerCategory, // Inherit category from parent
        parentPartnerId: partnerId,
        affiliateCommission: data.commission,
        // The affiliate's own commission rate is 0 - they earn through affiliateCommission
        commissionRate: 0,
        // Store temporary password (plain text) for admin/parent to see
        // Will be cleared after first login
        temporaryPassword: tempPassword,
      },
    })

    revalidatePath('/partner/affiliates')
    revalidatePath('/admin/partners')

    return {
      success: true,
      affiliateId: affiliate.id,
      message: 'Afiliado creado. Pendiente de aprobación.',
    }
  } catch (error) {
    console.error('Error creating affiliate:', error)
    return { success: false, error: 'Error al crear el afiliado' }
  }
}

export async function updateAffiliateCommission(affiliateId: string, commission: number) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Get the affiliate and verify ownership
    const affiliate = await prisma.partner.findUnique({
      where: { id: affiliateId },
      include: {
        parentPartner: true,
      },
    })

    if (!affiliate) {
      return { success: false, error: 'Afiliado no encontrado' }
    }

    if (affiliate.parentPartnerId !== partnerId) {
      return { success: false, error: 'No tienes permiso para modificar este afiliado' }
    }

    // Get parent commission to verify limits
    const parentCommission = affiliate.parentPartner?.commissionRate || 0

    if (commission > parentCommission) {
      return {
        success: false,
        error: `La comisión no puede ser mayor que tu comisión base (${parentCommission}%)`,
      }
    }

    if (commission < 0) {
      return { success: false, error: 'La comisión no puede ser negativa' }
    }

    // Update affiliate commission
    await prisma.partner.update({
      where: { id: affiliateId },
      data: { affiliateCommission: commission },
    })

    revalidatePath('/partner/affiliates')

    return { success: true }
  } catch (error) {
    console.error('Error updating affiliate commission:', error)
    return { success: false, error: 'Error al actualizar la comisión' }
  }
}

export async function getAffiliateLeads(affiliateId: string) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Verify the affiliate belongs to this partner
    const affiliate = await prisma.partner.findUnique({
      where: { id: affiliateId },
    })

    if (!affiliate || affiliate.parentPartnerId !== partnerId) {
      return { success: false, error: 'No tienes permiso para ver estos leads' }
    }

    // Get leads for this affiliate
    const leads = await prisma.lead.findMany({
      where: { partnerId: affiliateId },
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          where: { status: 'COMPLETED' },
        },
      },
    })

    return {
      success: true,
      leads: leads.map((lead) => ({
        id: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName,
        status: lead.status,
        createdAt: lead.createdAt.toISOString(),
        totalPayments: lead.payments.reduce((sum, p) => sum + p.amount, 0),
        totalCommission: lead.payments.reduce((sum, p) => sum + p.commissionAmount, 0),
      })),
    }
  } catch (error) {
    console.error('Error fetching affiliate leads:', error)
    return { success: false, error: 'Error al obtener los leads' }
  }
}
