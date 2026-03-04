'use server'

import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

// ============================================
// CERTIFICATION CONTENT ACTIONS
// ============================================

export async function createCertificationContent(data: {
  title: string
  content: string
  description?: string
  type: string
  url?: string
  order: number
  isPublished: boolean
}) {
  try {
    await getAdminSession()

    await prisma.certificationContent.create({
      data: {
        title: data.title,
        content: data.content,
        description: data.description || null,
        type: data.type,
        url: data.url || null,
        order: data.order,
        isPublished: data.isPublished,
      },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/partner/certification')
    return { success: true }
  } catch (error) {
    console.error('Error creating certification content:', error)
    return { success: false, error: 'Failed to create content' }
  }
}

export async function updateCertificationContent(
  id: string,
  data: {
    title: string
    content: string
    description?: string
    type: string
    url?: string
    order: number
    isPublished: boolean
  }
) {
  try {
    await getAdminSession()

    await prisma.certificationContent.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        description: data.description || null,
        type: data.type,
        url: data.url || null,
        order: data.order,
        isPublished: data.isPublished,
      },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/partner/certification')
    return { success: true }
  } catch (error) {
    console.error('Error updating certification content:', error)
    return { success: false, error: 'Failed to update content' }
  }
}

export async function deleteCertificationContent(id: string) {
  try {
    await getAdminSession()

    await prisma.certificationContent.delete({
      where: { id },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/partner/certification')
    return { success: true }
  } catch (error) {
    console.error('Error deleting certification content:', error)
    return { success: false, error: 'Failed to delete content' }
  }
}

// ============================================
// CERTIFICATION QUESTION ACTIONS
// ============================================

export async function createCertificationQuestion(data: {
  question: string
  options: string[] // Array of options
  correctAnswer: number
  explanation?: string
  order: number
  isActive: boolean
}) {
  try {
    await getAdminSession()

    await prisma.certificationQuestion.create({
      data: {
        question: data.question,
        options: JSON.stringify(data.options),
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || null,
        order: data.order,
        isActive: data.isActive,
      },
    })

    revalidatePath('/admin/certification')
    return { success: true }
  } catch (error) {
    console.error('Error creating certification question:', error)
    return { success: false, error: 'Failed to create question' }
  }
}

export async function updateCertificationQuestion(
  id: string,
  data: {
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
    order: number
    isActive: boolean
  }
) {
  try {
    await getAdminSession()

    await prisma.certificationQuestion.update({
      where: { id },
      data: {
        question: data.question,
        options: JSON.stringify(data.options),
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || null,
        order: data.order,
        isActive: data.isActive,
      },
    })

    revalidatePath('/admin/certification')
    return { success: true }
  } catch (error) {
    console.error('Error updating certification question:', error)
    return { success: false, error: 'Failed to update question' }
  }
}

export async function deleteCertificationQuestion(id: string) {
  try {
    await getAdminSession()

    await prisma.certificationQuestion.delete({
      where: { id },
    })

    revalidatePath('/admin/certification')
    return { success: true }
  } catch (error) {
    console.error('Error deleting certification question:', error)
    return { success: false, error: 'Failed to delete question' }
  }
}

// ============================================
// CERTIFICATION SETTINGS ACTIONS
// ============================================

export async function updateCertificationSettings(data: {
  badgeLightUrl?: string
  badgeDarkUrl?: string
  badgeHoverText?: string
  badgeAltText?: string
  validityMonths?: number
}) {
  try {
    await getAdminSession()

    // Get existing settings or create new
    const existing = await prisma.certificationSettings.findFirst()

    if (existing) {
      await prisma.certificationSettings.update({
        where: { id: existing.id },
        data: {
          badgeLightUrl: data.badgeLightUrl || null,
          badgeDarkUrl: data.badgeDarkUrl || null,
          badgeHoverText: data.badgeHoverText || null,
          badgeAltText: data.badgeAltText || null,
          validityMonths: data.validityMonths || 12,
        },
      })
    } else {
      await prisma.certificationSettings.create({
        data: {
          badgeLightUrl: data.badgeLightUrl || null,
          badgeDarkUrl: data.badgeDarkUrl || null,
          badgeHoverText: data.badgeHoverText || null,
          badgeAltText: data.badgeAltText || null,
          validityMonths: data.validityMonths || 12,
        },
      })
    }

    revalidatePath('/admin/certification')
    return { success: true }
  } catch (error) {
    console.error('Error updating certification settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}

// ============================================
// PARTNER CERTIFICATION ACTIONS
// ============================================

export async function grantCertification(partnerId: string) {
  try {
    await getAdminSession()

    // Get settings for validity
    const settings = await prisma.certificationSettings.findFirst()
    const validityMonths = settings?.validityMonths || 12

    const now = new Date()
    const expiresAt = new Date(now.setMonth(now.getMonth() + validityMonths))

    await prisma.partner.update({
      where: { id: partnerId },
      data: {
        isCertified: true,
        certifiedAt: new Date(),
        certificationExpiresAt: expiresAt,
      },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/admin/partners')
    return { success: true }
  } catch (error) {
    console.error('Error granting certification:', error)
    return { success: false, error: 'Failed to grant certification' }
  }
}

export async function revokeCertification(partnerId: string) {
  try {
    await getAdminSession()

    await prisma.partner.update({
      where: { id: partnerId },
      data: {
        isCertified: false,
        certifiedAt: null,
        certificationExpiresAt: null,
      },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/admin/partners')
    return { success: true }
  } catch (error) {
    console.error('Error revoking certification:', error)
    return { success: false, error: 'Failed to revoke certification' }
  }
}

export async function updatePartnerLandingUrl(partnerId: string, url: string) {
  try {
    await getAdminSession()

    await prisma.partner.update({
      where: { id: partnerId },
      data: {
        partnerLandingUrl: url || null,
      },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/admin/partners')
    return { success: true }
  } catch (error) {
    console.error('Error updating partner landing URL:', error)
    return { success: false, error: 'Failed to update landing URL' }
  }
}

// ============================================
// CERTIFICATION OBJECTIVES ACTIONS
// ============================================

export async function getCertificationObjectives() {
  try {
    const objectives = await prisma.certificationObjective.findMany({
      orderBy: { order: 'asc' },
    })
    return { success: true, data: objectives }
  } catch (error) {
    console.error('Error fetching certification objectives:', error)
    return { success: false, error: 'Failed to fetch objectives', data: [] }
  }
}

export async function getPublishedCertificationObjectives() {
  try {
    const objectives = await prisma.certificationObjective.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
    })
    return { success: true, data: objectives }
  } catch (error) {
    console.error('Error fetching published certification objectives:', error)
    return { success: false, error: 'Failed to fetch objectives', data: [] }
  }
}

export async function createCertificationObjective(data: {
  title: string
  description?: string
  title_en?: string
  description_en?: string
  title_it?: string
  description_it?: string
  title_fr?: string
  description_fr?: string
  title_de?: string
  description_de?: string
  title_pt?: string
  description_pt?: string
  icon?: string
  order: number
  isPublished: boolean
}) {
  try {
    await getAdminSession()

    await prisma.certificationObjective.create({
      data: {
        title: data.title,
        description: data.description || null,
        title_en: data.title_en || null,
        description_en: data.description_en || null,
        title_it: data.title_it || null,
        description_it: data.description_it || null,
        title_fr: data.title_fr || null,
        description_fr: data.description_fr || null,
        title_de: data.title_de || null,
        description_de: data.description_de || null,
        title_pt: data.title_pt || null,
        description_pt: data.description_pt || null,
        icon: data.icon || 'target',
        order: data.order,
        isPublished: data.isPublished,
      },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/partner/certification')
    return { success: true }
  } catch (error) {
    console.error('Error creating certification objective:', error)
    return { success: false, error: 'Failed to create objective' }
  }
}

export async function updateCertificationObjective(
  id: string,
  data: {
    title: string
    description?: string
    title_en?: string
    description_en?: string
    title_it?: string
    description_it?: string
    title_fr?: string
    description_fr?: string
    title_de?: string
    description_de?: string
    title_pt?: string
    description_pt?: string
    icon?: string
    order: number
    isPublished: boolean
  }
) {
  try {
    await getAdminSession()

    await prisma.certificationObjective.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        title_en: data.title_en || null,
        description_en: data.description_en || null,
        title_it: data.title_it || null,
        description_it: data.description_it || null,
        title_fr: data.title_fr || null,
        description_fr: data.description_fr || null,
        title_de: data.title_de || null,
        description_de: data.description_de || null,
        title_pt: data.title_pt || null,
        description_pt: data.description_pt || null,
        icon: data.icon || 'target',
        order: data.order,
        isPublished: data.isPublished,
      },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/partner/certification')
    return { success: true }
  } catch (error) {
    console.error('Error updating certification objective:', error)
    return { success: false, error: 'Failed to update objective' }
  }
}

export async function deleteCertificationObjective(id: string) {
  try {
    await getAdminSession()

    await prisma.certificationObjective.delete({
      where: { id },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/partner/certification')
    return { success: true }
  } catch (error) {
    console.error('Error deleting certification objective:', error)
    return { success: false, error: 'Failed to delete objective' }
  }
}
