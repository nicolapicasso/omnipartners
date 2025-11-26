'use server'

import { NotificationType } from './notifications'

// ============================================
// WEBHOOK CONFIGURATION
// ============================================

// Make webhook URL - should be set in environment variables
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL

// Hubspot API - optional direct integration
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY
const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID

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
}

// ============================================
// WEBHOOK PAYLOAD INTERFACES
// ============================================

interface WebhookPayload {
  event: WebhookEventType
  timestamp: string
  data: Record<string, unknown>
}

interface PartnerData {
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

interface LeadData {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  country: string
  status: string
  partnerId: string
  partnerName: string
}

interface PaymentData {
  id: string
  amount: number
  currency: string
  leadId: string
  clientName: string
  partnerId: string
  partnerName: string
  commissionAmount: number
}

// ============================================
// WEBHOOK SERVICE
// ============================================

/**
 * Send a webhook to Make (or other integrator)
 */
async function sendToMake(payload: WebhookPayload): Promise<boolean> {
  if (!MAKE_WEBHOOK_URL) {
    console.log('[Webhook] Make webhook URL not configured, skipping...')
    return false
  }

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('[Webhook] Failed to send to Make:', response.status, await response.text())
      return false
    }

    console.log('[Webhook] Successfully sent to Make:', payload.event)
    return true
  } catch (error) {
    console.error('[Webhook] Error sending to Make:', error)
    return false
  }
}

/**
 * Send webhook for partner events
 */
export async function sendPartnerWebhook(
  event: WebhookEventType,
  partner: PartnerData,
  additionalData?: Record<string, unknown>
) {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: {
      partner,
      ...additionalData,
    },
  }

  return sendToMake(payload)
}

/**
 * Send webhook for lead events
 */
export async function sendLeadWebhook(
  event: WebhookEventType,
  lead: LeadData,
  additionalData?: Record<string, unknown>
) {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: {
      lead,
      ...additionalData,
    },
  }

  return sendToMake(payload)
}

/**
 * Send webhook for payment events
 */
export async function sendPaymentWebhook(
  event: WebhookEventType,
  payment: PaymentData,
  additionalData?: Record<string, unknown>
) {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: {
      payment,
      ...additionalData,
    },
  }

  return sendToMake(payload)
}

/**
 * Send generic webhook
 */
export async function sendWebhook(
  event: WebhookEventType,
  data: Record<string, unknown>
) {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  }

  return sendToMake(payload)
}

// ============================================
// HUBSPOT INTEGRATION (Optional - Direct)
// ============================================

interface HubspotContact {
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

/**
 * Create or update a contact in Hubspot
 * Note: This is optional - you can also do this via Make
 */
export async function syncToHubspot(contact: HubspotContact): Promise<boolean> {
  if (!HUBSPOT_API_KEY) {
    console.log('[Hubspot] API key not configured, skipping...')
    return false
  }

  try {
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          properties: contact,
        }),
      }
    )

    if (!response.ok) {
      // Try to update if create fails (contact exists)
      const searchResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: 'email',
                    operator: 'EQ',
                    value: contact.email,
                  },
                ],
              },
            ],
          }),
        }
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.results?.length > 0) {
          const contactId = searchData.results[0].id
          await fetch(
            `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${HUBSPOT_API_KEY}`,
              },
              body: JSON.stringify({
                properties: contact,
              }),
            }
          )
          console.log('[Hubspot] Contact updated:', contact.email)
          return true
        }
      }
      return false
    }

    console.log('[Hubspot] Contact created:', contact.email)
    return true
  } catch (error) {
    console.error('[Hubspot] Error syncing contact:', error)
    return false
  }
}
