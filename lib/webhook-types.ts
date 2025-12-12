// ============================================
// WEBHOOK EVENT TYPES
// ============================================

export enum WebhookEventType {
  // Partner Events
  PARTNER_REGISTERED = 'partner.registered',
  PARTNER_APPROVED = 'partner.approved',
  PARTNER_REJECTED = 'partner.rejected',
  PARTNER_SUSPENDED = 'partner.suspended',
  PARTNER_CERTIFIED = 'partner.certified',

  // Lead Events
  LEAD_CREATED = 'lead.created',
  LEAD_UPDATED = 'lead.updated',
  LEAD_TO_PROSPECT = 'lead.converted_to_prospect',
  LEAD_TO_CLIENT = 'lead.converted_to_client',

  // Payment Events
  PAYMENT_RECEIVED = 'payment.received',
  COMMISSION_GENERATED = 'commission.generated',
  INVOICE_CREATED = 'invoice.created',

  // User Events
  USER_INVITED = 'user.invited',
  USER_JOINED = 'user.joined',

  // Requirement Events
  REQUIREMENT_COMPLETED = 'requirement.completed',
  ALL_REQUIREMENTS_MET = 'requirements.all_met',

  // Content Events
  CONTENT_PUBLISHED = 'content.published',
}

// ============================================
// WEBHOOK PAYLOAD INTERFACES
// ============================================

export interface WebhookPayload {
  event: WebhookEventType | string
  timestamp: string
  data: Record<string, unknown>
}

export interface PartnerData {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  country: string
  website?: string
  status: string
  category: string
}

export interface LeadData {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  phoneCountryCode?: string
  jobTitle?: string
  country: string
  status: string
  partnerId: string
  partnerName: string
}

export interface PaymentData {
  id: string
  amount: number
  currency: string
  leadId: string
  clientName: string
  partnerId: string
  partnerName: string
  commissionAmount: number
}

export interface ContentData {
  id: string
  title: string
  description?: string
  type: string
  category: string
  fileUrl?: string
  externalUrl?: string
  tags?: string[]
}

export interface HubspotContact {
  email: string
  firstname?: string
  lastname?: string
  company?: string
  phone?: string
  country?: string
  website?: string
  partner_status?: string
  partner_category?: string
}
