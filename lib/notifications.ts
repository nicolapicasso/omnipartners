'use server'

import { prisma } from '@/lib/prisma'

// ============================================
// NOTIFICATION TYPES
// ============================================

export enum NotificationType {
  // Partner Events
  PARTNER_REGISTERED = 'PARTNER_REGISTERED',
  PARTNER_APPROVED = 'PARTNER_APPROVED',
  PARTNER_REJECTED = 'PARTNER_REJECTED',
  PARTNER_SUSPENDED = 'PARTNER_SUSPENDED',

  // User Events
  USER_INVITED = 'USER_INVITED',
  USER_JOINED = 'USER_JOINED',

  // Lead Events
  LEAD_CREATED = 'LEAD_CREATED',
  LEAD_TO_PROSPECT = 'LEAD_TO_PROSPECT',
  LEAD_TO_CLIENT = 'LEAD_TO_CLIENT',

  // Payment Events
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  COMMISSION_GENERATED = 'COMMISSION_GENERATED',
  INVOICE_CREATED = 'INVOICE_CREATED',

  // Certification Events
  CERTIFICATION_PASSED = 'CERTIFICATION_PASSED',
  CERTIFICATION_FAILED = 'CERTIFICATION_FAILED',

  // Admin Events
  CONTRACT_UPLOADED = 'CONTRACT_UPLOADED',
  ACCOUNT_CONFIGURED = 'ACCOUNT_CONFIGURED',
  YEARLY_EVENT_COMPLETED = 'YEARLY_EVENT_COMPLETED',

  // Content Events
  NEW_CONTENT_AVAILABLE = 'NEW_CONTENT_AVAILABLE',

  // System Events
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

// ============================================
// NOTIFICATION TEMPLATES
// ============================================

interface NotificationTemplate {
  title: string
  message: string
}

const notificationTemplates: Record<NotificationType, (data?: Record<string, string>) => NotificationTemplate> = {
  // Partner Events
  [NotificationType.PARTNER_REGISTERED]: (data) => ({
    title: 'Nueva solicitud de partner',
    message: `${data?.companyName || 'Un nuevo partner'} ha solicitado unirse al programa.`,
  }),
  [NotificationType.PARTNER_APPROVED]: () => ({
    title: '¡Tu cuenta ha sido aprobada!',
    message: 'Bienvenido al programa de partners de Omniwallet. Ya puedes acceder a todas las funcionalidades.',
  }),
  [NotificationType.PARTNER_REJECTED]: () => ({
    title: 'Solicitud no aprobada',
    message: 'Lamentablemente tu solicitud no ha sido aprobada en este momento. Contacta con soporte para más información.',
  }),
  [NotificationType.PARTNER_SUSPENDED]: () => ({
    title: 'Cuenta suspendida',
    message: 'Tu cuenta de partner ha sido suspendida. Contacta con soporte para más información.',
  }),

  // User Events
  [NotificationType.USER_INVITED]: (data) => ({
    title: 'Has sido invitado',
    message: `Has sido invitado a unirte a ${data?.companyName || 'un equipo de partner'} en Omniwallet Partners.`,
  }),
  [NotificationType.USER_JOINED]: (data) => ({
    title: 'Nuevo miembro en el equipo',
    message: `${data?.userName || 'Un nuevo usuario'} se ha unido a tu equipo.`,
  }),

  // Lead Events
  [NotificationType.LEAD_CREATED]: (data) => ({
    title: 'Nuevo lead creado',
    message: `Se ha registrado un nuevo lead: ${data?.companyName || 'Empresa'}.`,
  }),
  [NotificationType.LEAD_TO_PROSPECT]: (data) => ({
    title: 'Lead convertido a prospect',
    message: `${data?.companyName || 'El lead'} ha sido convertido a prospect.`,
  }),
  [NotificationType.LEAD_TO_CLIENT]: (data) => ({
    title: '¡Nuevo cliente!',
    message: `¡Felicitaciones! ${data?.companyName || 'El prospect'} se ha convertido en cliente.`,
  }),

  // Payment Events
  [NotificationType.PAYMENT_RECEIVED]: (data) => ({
    title: 'Pago recibido',
    message: `Se ha recibido un pago de ${data?.amount || '€0'} de ${data?.clientName || 'un cliente'}.`,
  }),
  [NotificationType.COMMISSION_GENERATED]: (data) => ({
    title: 'Comisión generada',
    message: `Se ha generado una comisión de ${data?.amount || '€0'} por el pago de ${data?.clientName || 'un cliente'}.`,
  }),
  [NotificationType.INVOICE_CREATED]: (data) => ({
    title: 'Nueva factura',
    message: `Se ha creado una nueva factura por ${data?.amount || '€0'}.`,
  }),

  // Certification Events
  [NotificationType.CERTIFICATION_PASSED]: (data) => ({
    title: '¡Certificación completada!',
    message: data?.isPartner
      ? `¡Felicitaciones! Has obtenido tu certificación como Loyalty Partner con una puntuación del ${data?.score || '0'}%.`
      : `${data?.partnerName || 'Un partner'} ha completado la certificación con ${data?.score || '0'}%.`,
  }),
  [NotificationType.CERTIFICATION_FAILED]: (data) => ({
    title: 'Certificación no aprobada',
    message: `No has alcanzado la puntuación mínima (${data?.score || '0'}%). Puedes volver a intentarlo.`,
  }),

  // Admin Events
  [NotificationType.CONTRACT_UPLOADED]: () => ({
    title: 'Contrato disponible',
    message: 'Tu contrato de partnership ha sido subido y está disponible para descargar.',
  }),
  [NotificationType.ACCOUNT_CONFIGURED]: () => ({
    title: 'Cuenta Omniwallet configurada',
    message: 'Tu cuenta de Omniwallet ha sido configurada. Ya puedes acceder a ella desde tu dashboard.',
  }),
  [NotificationType.YEARLY_EVENT_COMPLETED]: () => ({
    title: 'Evento anual completado',
    message: '¡Has completado el requisito de evento/webinar conjunto del año!',
  }),

  // Content Events
  [NotificationType.NEW_CONTENT_AVAILABLE]: (data) => ({
    title: 'Nuevo contenido disponible',
    message: `Se ha publicado nuevo contenido: "${data?.contentTitle || 'Recurso'}".`,
  }),

  // System Events
  [NotificationType.SYSTEM_ANNOUNCEMENT]: (data) => ({
    title: data?.title || 'Anuncio del sistema',
    message: data?.message || 'Tienes un nuevo anuncio.',
  }),
}

// ============================================
// NOTIFICATION SERVICE
// ============================================

interface CreateNotificationParams {
  type: NotificationType
  userId?: string
  partnerId?: string
  data?: Record<string, string>
  customTitle?: string
  customMessage?: string
}

/**
 * Create a notification for a user or partner
 */
export async function createNotification({
  type,
  userId,
  partnerId,
  data,
  customTitle,
  customMessage,
}: CreateNotificationParams) {
  const template = notificationTemplates[type](data)

  const notification = await prisma.notification.create({
    data: {
      type,
      userId,
      partnerId,
      title: customTitle || template.title,
      message: customMessage || template.message,
      metadata: data ? JSON.stringify(data) : null,
    },
  })

  return notification
}

/**
 * Create notifications for all admin users
 */
export async function notifyAdmins(type: NotificationType, data?: Record<string, string>) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  })

  const notifications = await Promise.all(
    admins.map((admin) =>
      createNotification({
        type,
        userId: admin.id,
        data,
      })
    )
  )

  return notifications
}

/**
 * Create notification for all users of a partner
 */
export async function notifyPartnerUsers(partnerId: string, type: NotificationType, data?: Record<string, string>) {
  const users = await prisma.user.findMany({
    where: { partnerId },
    select: { id: true },
  })

  const notifications = await Promise.all(
    users.map((user) =>
      createNotification({
        type,
        userId: user.id,
        partnerId,
        data,
      })
    )
  )

  return notifications
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: string, limit = 20) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return notifications
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })

  return count
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string) {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  return notification
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })
}

/**
 * Delete old notifications (older than 90 days)
 */
export async function cleanupOldNotifications() {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  await prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: ninetyDaysAgo,
      },
      isRead: true,
    },
  })
}
