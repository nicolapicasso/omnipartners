'use server'

import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

// ============================================
// PARTNER REQUIREMENTS CONFIGURATION ACTIONS
// ============================================

export type RequirementConfig = {
  id: string
  scope: string
  partnerCategory: string | null
  partnerId: string | null
  leadsPerYear: number
  prospectsPerYear: number
  clientsPerYear: number
  eventsPerYear: number
  certificationRequired: boolean
  contractRequired: boolean
  omniwalletRequired: boolean
  leadsLabel: string | null
  prospectsLabel: string | null
  clientsLabel: string | null
  eventsLabel: string | null
}

// Default values when no config exists
export const DEFAULT_REQUIREMENTS = {
  leadsPerYear: 10,
  prospectsPerYear: 5,
  clientsPerYear: 2,
  eventsPerYear: 1,
  certificationRequired: true,
  contractRequired: true,
  omniwalletRequired: true,
}

// Get all requirement configurations
export async function getRequirementConfigs() {
  try {
    const configs = await prisma.partnerRequirementConfig.findMany({
      orderBy: [
        { scope: 'asc' },
        { partnerCategory: 'asc' },
      ],
    })
    return { success: true, data: configs }
  } catch (error) {
    console.error('Error fetching requirement configs:', error)
    return { success: false, error: 'Failed to fetch configs', data: [] }
  }
}

// Get global requirements config (or create default if not exists)
export async function getGlobalRequirements() {
  try {
    let config = await prisma.partnerRequirementConfig.findFirst({
      where: { scope: 'GLOBAL' },
    })

    if (!config) {
      config = await prisma.partnerRequirementConfig.create({
        data: {
          scope: 'GLOBAL',
          ...DEFAULT_REQUIREMENTS,
        },
      })
    }

    return { success: true, data: config }
  } catch (error) {
    console.error('Error fetching global requirements:', error)
    return { success: false, error: 'Failed to fetch global requirements', data: null }
  }
}

// Get requirements for a specific partner (resolves hierarchy: partner > category > global)
export async function getRequirementsForPartner(partnerId: string) {
  try {
    // Get partner info to know their category
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { partnerCategory: true },
    })

    if (!partner) {
      return { success: false, error: 'Partner not found', data: null }
    }

    // 1. Check for partner-specific override
    const partnerConfig = await prisma.partnerRequirementConfig.findFirst({
      where: { scope: 'BY_PARTNER', partnerId },
    })

    if (partnerConfig) {
      return { success: true, data: partnerConfig }
    }

    // 2. Check for category-specific config
    const categoryConfig = await prisma.partnerRequirementConfig.findFirst({
      where: { scope: 'BY_CATEGORY', partnerCategory: partner.partnerCategory },
    })

    if (categoryConfig) {
      return { success: true, data: categoryConfig }
    }

    // 3. Fall back to global config
    const globalConfig = await prisma.partnerRequirementConfig.findFirst({
      where: { scope: 'GLOBAL' },
    })

    if (globalConfig) {
      return { success: true, data: globalConfig }
    }

    // 4. Return defaults if nothing exists
    return {
      success: true,
      data: {
        id: 'default',
        scope: 'GLOBAL',
        partnerCategory: null,
        partnerId: null,
        ...DEFAULT_REQUIREMENTS,
        leadsLabel: null,
        prospectsLabel: null,
        clientsLabel: null,
        eventsLabel: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
  } catch (error) {
    console.error('Error fetching requirements for partner:', error)
    return { success: false, error: 'Failed to fetch requirements', data: null }
  }
}

// Update global requirements
export async function updateGlobalRequirements(data: {
  leadsPerYear: number
  prospectsPerYear: number
  clientsPerYear: number
  eventsPerYear: number
  certificationRequired: boolean
  contractRequired: boolean
  omniwalletRequired: boolean
}) {
  try {
    await getAdminSession()

    const existing = await prisma.partnerRequirementConfig.findFirst({
      where: { scope: 'GLOBAL' },
    })

    if (existing) {
      await prisma.partnerRequirementConfig.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.partnerRequirementConfig.create({
        data: {
          scope: 'GLOBAL',
          ...data,
        },
      })
    }

    revalidatePath('/admin/requirements')
    revalidatePath('/partner/requirements')
    return { success: true }
  } catch (error) {
    console.error('Error updating global requirements:', error)
    return { success: false, error: 'Failed to update global requirements' }
  }
}

// Create or update category-specific requirements
export async function upsertCategoryRequirements(
  partnerCategory: string,
  data: {
    leadsPerYear: number
    prospectsPerYear: number
    clientsPerYear: number
    eventsPerYear: number
    certificationRequired: boolean
    contractRequired: boolean
    omniwalletRequired: boolean
  }
) {
  try {
    await getAdminSession()

    const existing = await prisma.partnerRequirementConfig.findFirst({
      where: { scope: 'BY_CATEGORY', partnerCategory },
    })

    if (existing) {
      await prisma.partnerRequirementConfig.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.partnerRequirementConfig.create({
        data: {
          scope: 'BY_CATEGORY',
          partnerCategory,
          ...data,
        },
      })
    }

    revalidatePath('/admin/requirements')
    revalidatePath('/partner/requirements')
    return { success: true }
  } catch (error) {
    console.error('Error upserting category requirements:', error)
    return { success: false, error: 'Failed to update category requirements' }
  }
}

// Delete category-specific requirements (falls back to global)
export async function deleteCategoryRequirements(partnerCategory: string) {
  try {
    await getAdminSession()

    await prisma.partnerRequirementConfig.deleteMany({
      where: { scope: 'BY_CATEGORY', partnerCategory },
    })

    revalidatePath('/admin/requirements')
    revalidatePath('/partner/requirements')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category requirements:', error)
    return { success: false, error: 'Failed to delete category requirements' }
  }
}

// Create partner-specific override
export async function createPartnerOverride(
  partnerId: string,
  data: {
    leadsPerYear: number
    prospectsPerYear: number
    clientsPerYear: number
    eventsPerYear: number
    certificationRequired: boolean
    contractRequired: boolean
    omniwalletRequired: boolean
  }
) {
  try {
    await getAdminSession()

    // Check if override already exists
    const existing = await prisma.partnerRequirementConfig.findFirst({
      where: { scope: 'BY_PARTNER', partnerId },
    })

    if (existing) {
      await prisma.partnerRequirementConfig.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.partnerRequirementConfig.create({
        data: {
          scope: 'BY_PARTNER',
          partnerId,
          ...data,
        },
      })
    }

    revalidatePath('/admin/requirements')
    revalidatePath('/admin/partners')
    revalidatePath('/partner/requirements')
    return { success: true }
  } catch (error) {
    console.error('Error creating partner override:', error)
    return { success: false, error: 'Failed to create partner override' }
  }
}

// Delete partner-specific override (falls back to category/global)
export async function deletePartnerOverride(partnerId: string) {
  try {
    await getAdminSession()

    await prisma.partnerRequirementConfig.deleteMany({
      where: { scope: 'BY_PARTNER', partnerId },
    })

    revalidatePath('/admin/requirements')
    revalidatePath('/admin/partners')
    revalidatePath('/partner/requirements')
    return { success: true }
  } catch (error) {
    console.error('Error deleting partner override:', error)
    return { success: false, error: 'Failed to delete partner override' }
  }
}
