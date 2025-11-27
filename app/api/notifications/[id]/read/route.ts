import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// POST /api/notifications/[id]/read - Mark a notification as read
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificacion no encontrada' },
        { status: 404 }
      )
    }

    // Verify user owns this notification
    // For PARTNER_OWNER, check partnerId; for others, check userId
    const isPartnerOwner = session.user.role === 'PARTNER_OWNER'
    const isOwner = isPartnerOwner
      ? notification.partnerId === session.user.id
      : notification.userId === session.user.id

    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ notification: updated })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Error al actualizar notificacion' },
      { status: 500 }
    )
  }
}
