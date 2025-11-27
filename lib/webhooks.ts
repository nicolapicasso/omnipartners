'use server'

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import {
  WebhookEventType,
  WebhookPayload,
  PartnerData,
  LeadData,
  PaymentData,
  ContentData,
  HubspotContact
} from './webhook-types'

// ============================================
// WEBHOOK SERVICE
// ============================================

/**
 * Get all active subscriptions for a given event type
 */
async function getSubscriptionsForEvent(event: WebhookEventType | string) {
  const subscriptions = await prisma.webhookSubscription.findMany({
    where: {
      isActive: true
    }
  })

  // Filter subscriptions that include this event
  return subscriptions.filter(sub => {
    const events = JSON.parse(sub.events) as string[]
    return events.includes(event)
  })
}

/**
 * Create HMAC signature for webhook payload
 */
function createSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

/**
 * Send webhook to a single subscription URL
 */
async function sendToSubscription(
  subscriptionId: string,
  url: string,
  secret: string | null,
  payload: WebhookPayload
): Promise<{ success: boolean; statusCode?: number; responseTime: number; error?: string }> {
  const startTime = Date.now()
  const payloadString = JSON.stringify(payload)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': payload.event,
      'X-Webhook-Timestamp': payload.timestamp
    }

    // Add signature if secret exists
    if (secret) {
      headers['X-Webhook-Signature'] = createSignature(payloadString, secret)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payloadString
    })

    const responseTime = Date.now() - startTime
    const responseBody = await response.text()

    // Log the webhook delivery
    await prisma.webhookLog.create({
      data: {
        subscriptionId,
        event: payload.event,
        payload: payloadString,
        statusCode: response.status,
        responseBody: responseBody.substring(0, 1000),
        responseTime,
        success: response.ok,
        errorMessage: response.ok ? null : `HTTP ${response.status}`
      }
    })

    // Update subscription stats
    await prisma.webhookSubscription.update({
      where: { id: subscriptionId },
      data: {
        lastTriggeredAt: new Date(),
        successCount: response.ok ? { increment: 1 } : undefined,
        failureCount: !response.ok ? { increment: 1 } : undefined
      }
    })

    return {
      success: response.ok,
      statusCode: response.status,
      responseTime
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Log the failed delivery
    await prisma.webhookLog.create({
      data: {
        subscriptionId,
        event: payload.event,
        payload: payloadString,
        responseTime,
        success: false,
        errorMessage
      }
    })

    // Update subscription failure count
    await prisma.webhookSubscription.update({
      where: { id: subscriptionId },
      data: {
        lastTriggeredAt: new Date(),
        failureCount: { increment: 1 }
      }
    })

    return {
      success: false,
      responseTime,
      error: errorMessage
    }
  }
}

/**
 * Dispatch webhook event to all subscribed URLs
 */
async function dispatchWebhook(event: WebhookEventType, data: Record<string, unknown>) {
  const subscriptions = await getSubscriptionsForEvent(event)

  if (subscriptions.length === 0) {
    console.log(`[Webhook] No subscriptions for event: ${event}`)
    return []
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data
  }

  console.log(`[Webhook] Dispatching ${event} to ${subscriptions.length} subscription(s)`)

  // Send to all subscriptions in parallel
  const results = await Promise.all(
    subscriptions.map(sub =>
      sendToSubscription(sub.id, sub.url, sub.secret, payload)
    )
  )

  const successCount = results.filter(r => r.success).length
  console.log(`[Webhook] ${event}: ${successCount}/${subscriptions.length} successful`)

  return results
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Send webhook for partner events
 */
export async function sendPartnerWebhook(
  event: WebhookEventType,
  partner: PartnerData,
  additionalData?: Record<string, unknown>
) {
  return dispatchWebhook(event, {
    partner,
    ...additionalData
  })
}

/**
 * Send webhook for lead events
 */
export async function sendLeadWebhook(
  event: WebhookEventType,
  lead: LeadData,
  additionalData?: Record<string, unknown>
) {
  return dispatchWebhook(event, {
    lead,
    ...additionalData
  })
}

/**
 * Send webhook for payment events
 */
export async function sendPaymentWebhook(
  event: WebhookEventType,
  payment: PaymentData,
  additionalData?: Record<string, unknown>
) {
  return dispatchWebhook(event, {
    payment,
    ...additionalData
  })
}

/**
 * Send webhook for content events
 */
export async function sendContentWebhook(
  event: WebhookEventType,
  content: ContentData,
  additionalData?: Record<string, unknown>
) {
  return dispatchWebhook(event, {
    content,
    ...additionalData
  })
}

/**
 * Send generic webhook
 */
export async function sendWebhook(
  event: WebhookEventType,
  data: Record<string, unknown>
) {
  return dispatchWebhook(event, data)
}

// ============================================
// HUBSPOT INTEGRATION (Optional - Direct)
// ============================================

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY

/**
 * Create or update a contact in Hubspot
 * Note: This is optional - you can also do this via webhooks to Make
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
