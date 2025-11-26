'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PartnerStatus, NotificationType, PartnerCategory } from '@/types'
import { getAdminSession } from '@/lib/session'

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
