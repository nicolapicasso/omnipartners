'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAdminSession } from '@/lib/session'
import { ContentType, ContentCategory, ContentStatus, NotificationType } from '@/types'

export async function createContent(data: {
  title: string
  description?: string
  type: ContentType
  category: ContentCategory
  fileUrl?: string
  externalUrl?: string
  tags?: string[]
  isFeatured?: boolean
  order?: number
  status?: ContentStatus
}) {
  try {
    await getAdminSession()

    const content = await prisma.content.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        fileUrl: data.fileUrl,
        externalUrl: data.externalUrl,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isFeatured: data.isFeatured || false,
        order: data.order || 0,
        status: data.status || ContentStatus.DRAFT,
      },
    })

    // If published, notify all partners
    if (data.status === ContentStatus.PUBLISHED) {
      const partners = await prisma.partner.findMany({
        where: { status: 'ACTIVE' },
      })

      await Promise.all(
        partners.map((partner) =>
          prisma.notification.create({
            data: {
              partnerId: partner.id,
              type: NotificationType.NEW_CONTENT,
              title: 'Nuevo Contenido Disponible',
              message: `Se ha publicado nuevo contenido: ${data.title}`,
              metadata: JSON.stringify({
                contentId: content.id,
                contentType: data.type,
                contentCategory: data.category,
              }),
            },
          })
        )
      )
    }

    revalidatePath('/admin/content')
    return { success: true, contentId: content.id }
  } catch (error) {
    console.error('Error creating content:', error)
    return { success: false, error: 'Error al crear el contenido' }
  }
}

export async function updateContent(
  contentId: string,
  data: {
    title?: string
    description?: string
    type?: ContentType
    category?: ContentCategory
    fileUrl?: string
    externalUrl?: string
    tags?: string[]
    isFeatured?: boolean
    order?: number
    status?: ContentStatus
  }
) {
  try {
    await getAdminSession()

    const oldContent = await prisma.content.findUnique({
      where: { id: contentId },
    })

    if (!oldContent) {
      return { success: false, error: 'Contenido no encontrado' }
    }

    const content = await prisma.content.update({
      where: { id: contentId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type && { type: data.type }),
        ...(data.category && { category: data.category }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
        ...(data.externalUrl !== undefined && { externalUrl: data.externalUrl }),
        ...(data.tags && { tags: JSON.stringify(data.tags) }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.status && { status: data.status }),
      },
    })

    // If just published, notify partners
    if (data.status === ContentStatus.PUBLISHED && oldContent.status === ContentStatus.DRAFT) {
      const partners = await prisma.partner.findMany({
        where: { status: 'ACTIVE' },
      })

      await Promise.all(
        partners.map((partner) =>
          prisma.notification.create({
            data: {
              partnerId: partner.id,
              type: NotificationType.NEW_CONTENT,
              title: 'Nuevo Contenido Disponible',
              message: `Se ha publicado nuevo contenido: ${content.title}`,
              metadata: JSON.stringify({
                contentId: content.id,
                contentType: content.type,
                contentCategory: content.category,
              }),
            },
          })
        )
      )
    }

    revalidatePath('/admin/content')
    revalidatePath(`/admin/content/${contentId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating content:', error)
    return { success: false, error: 'Error al actualizar el contenido' }
  }
}

export async function deleteContent(contentId: string) {
  try {
    await getAdminSession()

    await prisma.content.delete({
      where: { id: contentId },
    })

    revalidatePath('/admin/content')
    return { success: true }
  } catch (error) {
    console.error('Error deleting content:', error)
    return { success: false, error: 'Error al eliminar el contenido' }
  }
}

export async function toggleContentStatus(contentId: string) {
  try {
    await getAdminSession()

    const content = await prisma.content.findUnique({
      where: { id: contentId },
    })

    if (!content) {
      return { success: false, error: 'Contenido no encontrado' }
    }

    const newStatus =
      content.status === ContentStatus.PUBLISHED ? ContentStatus.DRAFT : ContentStatus.PUBLISHED

    await prisma.content.update({
      where: { id: contentId },
      data: { status: newStatus },
    })

    revalidatePath('/admin/content')
    return { success: true, status: newStatus }
  } catch (error) {
    console.error('Error toggling content status:', error)
    return { success: false, error: 'Error al cambiar el estado' }
  }
}

export async function getContentStats() {
  try {
    await getAdminSession()

    const [totalContent, publishedContent, draftContent] = await Promise.all([
      prisma.content.count(),
      prisma.content.count({ where: { status: ContentStatus.PUBLISHED } }),
      prisma.content.count({ where: { status: ContentStatus.DRAFT } }),
    ])

    const topViewed = await prisma.content.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { viewCount: 'desc' },
      take: 5,
    })

    const topDownloaded = await prisma.content.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { downloadCount: 'desc' },
      take: 5,
    })

    const viewsByCategory = await prisma.content.groupBy({
      by: ['category'],
      _sum: {
        viewCount: true,
      },
      where: { status: ContentStatus.PUBLISHED },
    })

    return {
      success: true,
      stats: {
        totalContent,
        publishedContent,
        draftContent,
        topViewed,
        topDownloaded,
        viewsByCategory,
      },
    }
  } catch (error) {
    console.error('Error getting content stats:', error)
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}
