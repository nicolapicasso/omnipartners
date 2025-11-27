import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Build where clause based on user role
    // For PARTNER_OWNER, the id is actually the partnerId
    // For other roles (ADMIN, PARTNER_USER), the id is the userId
    const isPartnerOwner = session.user.role === 'PARTNER_OWNER'

    const baseWhere = isPartnerOwner
      ? { partnerId: session.user.id }
      : { userId: session.user.id }

    const where: Record<string, unknown> = { ...baseWhere }
    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: {
          ...baseWhere,
          isRead: false,
        },
      }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    )
  }
}
