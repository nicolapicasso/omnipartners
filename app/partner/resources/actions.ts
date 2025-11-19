'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getPartnerSession } from '@/lib/session'

export async function trackContentView(contentId: string, downloaded: boolean = false) {
  try {
    const session = await getPartnerSession()
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    // Create view record
    await prisma.contentView.create({
      data: {
        contentId,
        userId: user.id,
        downloaded,
      },
    })

    // Increment counter
    if (downloaded) {
      await prisma.content.update({
        where: { id: contentId },
        data: { downloadCount: { increment: 1 } },
      })
    } else {
      await prisma.content.update({
        where: { id: contentId },
        data: { viewCount: { increment: 1 } },
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error tracking content view:', error)
    return { success: false, error: 'Error al registrar visualización' }
  }
}

export async function toggleFavorite(contentId: string) {
  try {
    const session = await getPartnerSession()
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    // Check if already favorited
    const existing = await prisma.contentFavorite.findFirst({
      where: {
        contentId,
        userId: user.id,
      },
    })

    if (existing) {
      // Remove favorite
      await prisma.contentFavorite.delete({
        where: { id: existing.id },
      })
      revalidatePath('/partner/resources')
      revalidatePath('/partner/resources/favorites')
      return { success: true, isFavorite: false }
    } else {
      // Add favorite
      await prisma.contentFavorite.create({
        data: {
          contentId,
          userId: user.id,
        },
      })
      revalidatePath('/partner/resources')
      revalidatePath('/partner/resources/favorites')
      return { success: true, isFavorite: true }
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return { success: false, error: 'Error al cambiar favorito' }
  }
}
