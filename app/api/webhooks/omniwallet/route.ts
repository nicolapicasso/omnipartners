import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentWebhook } from '@/lib/webhooks'
import { WebhookEventType } from '@/lib/webhook-types'
import { notifyPartnerUsers } from '@/lib/notifications'
import { NotificationType } from '@/lib/notification-types'
import crypto from 'crypto'

// ============================================
// TYPES
// ============================================

interface OmniwalletPaymentPayload {
  // Identificadores
  externalReference: string      // ID del pago en Omniwallet
  clientEmail?: string           // Email del cliente para buscar el Lead
  clientExternalId?: string      // ID externo del cliente en Omniwallet

  // Datos del pago
  amount: number                 // Monto del pago
  currency?: string              // Moneda (default: EUR)
  paymentDate?: string           // Fecha del pago (ISO string)
  description?: string           // Descripcion del pago

  // Estado
  status?: 'PENDING' | 'COMPLETED' | 'FAILED'
}

// ============================================
// SIGNATURE VERIFICATION
// ============================================

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// ============================================
// WEBHOOK HANDLER
// ============================================

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.OMNIWALLET_WEBHOOK_SECRET
  const API_KEY = process.env.OMNIWALLET_API_KEY

  try {
    // Get raw body for signature verification
    const rawBody = await req.text()
    let payload: OmniwalletPaymentPayload

    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // ============================================
    // AUTHENTICATION (multiple methods supported)
    // ============================================

    // Method 1: Signature verification (preferred)
    const signature = req.headers.get('x-omniwallet-signature')
    if (signature && WEBHOOK_SECRET) {
      if (!verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
        console.error('[Omniwallet Webhook] Invalid signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }
    // Method 2: API Key verification
    else if (API_KEY) {
      const providedApiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
      if (providedApiKey !== API_KEY) {
        console.error('[Omniwallet Webhook] Invalid API key')
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      }
    }
    // Method 3: No authentication configured (development only)
    else if (process.env.NODE_ENV === 'production') {
      console.error('[Omniwallet Webhook] No authentication configured')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // ============================================
    // VALIDATE PAYLOAD
    // ============================================

    if (!payload.externalReference) {
      return NextResponse.json(
        { error: 'Missing required field: externalReference' },
        { status: 400 }
      )
    }

    if (typeof payload.amount !== 'number' || payload.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount: must be a positive number' },
        { status: 400 }
      )
    }

    if (!payload.clientEmail && !payload.clientExternalId) {
      return NextResponse.json(
        { error: 'Missing client identifier: provide clientEmail or clientExternalId' },
        { status: 400 }
      )
    }

    // ============================================
    // CHECK FOR DUPLICATE PAYMENT
    // ============================================

    const existingPayment = await prisma.payment.findFirst({
      where: { externalReference: payload.externalReference }
    })

    if (existingPayment) {
      console.log(`[Omniwallet Webhook] Payment already exists: ${payload.externalReference}`)
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        paymentId: existingPayment.id,
        duplicate: true
      })
    }

    // ============================================
    // FIND THE LEAD (CLIENT)
    // ============================================

    let lead = null

    // Try to find by email first
    if (payload.clientEmail) {
      lead = await prisma.lead.findFirst({
        where: {
          email: payload.clientEmail,
          status: 'CLIENT'  // Only look for converted clients
        },
        include: {
          partner: {
            select: {
              id: true,
              companyName: true,
              parentPartnerId: true,
              affiliateCommission: true,
              parentPartner: {
                select: {
                  id: true,
                  companyName: true,
                  commissionRate: true,
                }
              }
            }
          }
        }
      })
    }

    // If not found and we have an external ID, try that
    // (This would require adding an externalClientId field to Lead model)

    if (!lead) {
      console.error(`[Omniwallet Webhook] Lead not found for: ${payload.clientEmail || payload.clientExternalId}`)
      return NextResponse.json(
        {
          error: 'Client not found',
          message: 'No lead with CLIENT status found for the provided identifier'
        },
        { status: 404 }
      )
    }

    // ============================================
    // CALCULATE COMMISSION (with affiliate split support)
    // ============================================

    const commissionAmount = payload.amount * (lead.commissionRate / 100)

    // Calculate affiliate split if applicable
    const isAffiliateLead = !!lead.partner.parentPartnerId && !!lead.partner.parentPartner
    let affiliateCommission = 0
    let parentCommission = 0

    if (isAffiliateLead) {
      // This lead belongs to an affiliate - split the commission
      const affiliateRate = lead.partner.affiliateCommission || 0
      const parentRate = (lead.partner.parentPartner?.commissionRate || lead.commissionRate) - affiliateRate

      affiliateCommission = payload.amount * (affiliateRate / 100)
      parentCommission = payload.amount * (parentRate / 100)

      console.log(`[Omniwallet Webhook] Affiliate split: Affiliate ${affiliateRate}% (€${affiliateCommission.toFixed(2)}) | Parent ${parentRate}% (€${parentCommission.toFixed(2)})`)
    }

    // ============================================
    // CREATE PAYMENT RECORD
    // ============================================

    const payment = await prisma.payment.create({
      data: {
        leadId: lead.id,
        amount: payload.amount,
        currency: payload.currency || 'EUR',
        paymentDate: payload.paymentDate ? new Date(payload.paymentDate) : new Date(),
        status: payload.status || 'COMPLETED',
        commissionAmount, // Total commission amount
        externalReference: payload.externalReference,
        description: payload.description
      }
    })

    console.log(`[Omniwallet Webhook] Payment created: ${payment.id} - Amount: €${payload.amount} - Commission: €${commissionAmount}`)

    // ============================================
    // SEND NOTIFICATIONS
    // ============================================

    if (isAffiliateLead && lead.partner.parentPartner) {
      // Send notifications to BOTH affiliate and parent partner

      // Notify affiliate about their commission
      await notifyPartnerUsers(
        lead.partnerId, // The affiliate
        NotificationType.PAYMENT_RECEIVED,
        {
          amount: `€${payload.amount.toFixed(2)}`,
          clientName: lead.companyName
        }
      )
      await notifyPartnerUsers(
        lead.partnerId,
        NotificationType.COMMISSION_GENERATED,
        {
          amount: `€${affiliateCommission.toFixed(2)}`,
          clientName: lead.companyName
        }
      )

      // Notify parent partner about their commission
      await notifyPartnerUsers(
        lead.partner.parentPartner.id, // The parent partner
        NotificationType.PAYMENT_RECEIVED,
        {
          amount: `€${payload.amount.toFixed(2)}`,
          clientName: `${lead.companyName} (via ${lead.partner.companyName})`
        }
      )
      await notifyPartnerUsers(
        lead.partner.parentPartner.id,
        NotificationType.COMMISSION_GENERATED,
        {
          amount: `€${parentCommission.toFixed(2)}`,
          clientName: `${lead.companyName} (via ${lead.partner.companyName})`
        }
      )
    } else {
      // Regular partner (no affiliate) - single notification
      await notifyPartnerUsers(
        lead.partnerId,
        NotificationType.PAYMENT_RECEIVED,
        {
          amount: `€${payload.amount.toFixed(2)}`,
          clientName: lead.companyName
        }
      )
      await notifyPartnerUsers(
        lead.partnerId,
        NotificationType.COMMISSION_GENERATED,
        {
          amount: `€${commissionAmount.toFixed(2)}`,
          clientName: lead.companyName
        }
      )
    }

    // ============================================
    // DISPATCH OUTBOUND WEBHOOKS
    // ============================================

    const webhookPayload = {
      id: payment.id,
      amount: payload.amount,
      currency: payload.currency || 'EUR',
      leadId: lead.id,
      clientName: lead.companyName,
      partnerId: lead.partnerId,
      partnerName: lead.partner.companyName,
      commissionAmount,
      externalReference: payload.externalReference,
      // Include affiliate info if applicable
      ...(isAffiliateLead && lead.partner.parentPartner && {
        isAffiliateLead: true,
        affiliateCommission,
        parentCommission,
        parentPartnerId: lead.partner.parentPartner.id,
        parentPartnerName: lead.partner.parentPartner.companyName,
      })
    }

    // Send payment.received webhook
    await sendPaymentWebhook(
      WebhookEventType.PAYMENT_RECEIVED,
      webhookPayload
    )

    // Send commission.generated webhook
    await sendPaymentWebhook(
      WebhookEventType.COMMISSION_GENERATED,
      webhookPayload
    )

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: payment.id,
        amount: payload.amount,
        currency: payload.currency || 'EUR',
        commissionAmount,
        commissionRate: lead.commissionRate,
        leadId: lead.id,
        clientName: lead.companyName,
        partnerId: lead.partnerId,
        partnerName: lead.partner.companyName,
        // Include affiliate split info if applicable
        ...(isAffiliateLead && lead.partner.parentPartner && {
          isAffiliateLead: true,
          affiliateCommission,
          parentCommission,
          parentPartnerId: lead.partner.parentPartner.id,
          parentPartnerName: lead.partner.parentPartner.companyName,
        })
      }
    })

  } catch (error) {
    console.error('[Omniwallet Webhook] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// HEALTH CHECK
// ============================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhooks/omniwallet',
    description: 'Omniwallet payment notification webhook',
    methods: ['POST'],
    requiredHeaders: [
      'x-omniwallet-signature (HMAC-SHA256) OR',
      'x-api-key OR',
      'Authorization: Bearer <api-key>'
    ],
    requiredFields: {
      externalReference: 'string (required) - Payment ID from Omniwallet',
      clientEmail: 'string (required if no clientExternalId) - Client email to match Lead',
      clientExternalId: 'string (required if no clientEmail) - External client ID',
      amount: 'number (required) - Payment amount',
      currency: 'string (optional, default: EUR)',
      paymentDate: 'string (optional, ISO date)',
      status: 'string (optional: PENDING, COMPLETED, FAILED)',
      description: 'string (optional)'
    },
    examplePayload: {
      externalReference: 'PAY-12345',
      clientEmail: 'client@company.com',
      amount: 500.00,
      currency: 'EUR',
      paymentDate: '2024-01-15T10:30:00Z',
      status: 'COMPLETED',
      description: 'Monthly subscription'
    }
  })
}
