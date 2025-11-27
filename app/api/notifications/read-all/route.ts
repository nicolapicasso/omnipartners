import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build where clause based on user role
    // For PARTNER_OWNER, the id is actually the partnerId
    // For other roles (ADMIN, PARTNER_USER), the id is the userId
    const isPartnerOwner = session.user.role === 'PARTNER_OWNER'

    const where = isPartnerOwner
      ? { partnerId: session.user.id, isRead: false }
      : { userId: session.user.id, isRead: false }

    await prisma.notification.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Error al actualizar notificaciones' },
      { status: 500 }
    )
  }
}
