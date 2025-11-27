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

export interface NotificationTemplate {
  title: string
  message: string
}

export interface CreateNotificationParams {
  type: NotificationType
  userId?: string
  partnerId?: string
  data?: Record<string, string>
  customTitle?: string
  customMessage?: string
}
