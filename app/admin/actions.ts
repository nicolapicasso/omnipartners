'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PartnerStatus } from '@prisma/client'

export async function approvePartner(partnerId: string) {
  try {
    await prisma.partner.update({
      where: { id: partnerId },
      data: { status: PartnerStatus.ACTIVE },
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error approving partner:', error)
    return { success: false, error: 'Failed to approve partner' }
  }
}

export async function rejectPartner(partnerId: string) {
  try {
    await prisma.partner.update({
      where: { id: partnerId },
      data: { status: PartnerStatus.REJECTED },
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting partner:', error)
    return { success: false, error: 'Failed to reject partner' }
  }
}
