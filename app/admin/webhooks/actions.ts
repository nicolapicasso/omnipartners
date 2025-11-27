'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { WebhookEventType } from '@/lib/webhooks'
import crypto from 'crypto'

// ============================================
// TYPES
// ============================================

export interface WebhookSubscriptionData {
  name: string
  url: string
  events: string[]
  description?: string
  secret?: string
  isActive?: boolean
}

// ============================================
// QUERIES
// ============================================

export async function getWebhookSubscriptions() {
  const subscriptions = await prisma.webhookSubscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { logs: true }
      }
    }
  })

  return subscriptions.map(sub => ({
    ...sub,
    events: JSON.parse(sub.events) as string[],
    logsCount: sub._count.logs
  }))
}

export async function getWebhookSubscription(id: string) {
  const subscription = await prisma.webhookSubscription.findUnique({
    where: { id },
    include: {
      logs: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  })

  if (!subscription) return null

  return {
    ...subscription,
    events: JSON.parse(subscription.events) as string[]
  }
}

export async function getWebhookLogs(subscriptionId: string, limit = 50) {
  const logs = await prisma.webhookLog.findMany({
    where: { subscriptionId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return logs
}

// ============================================
// MUTATIONS
// ============================================

export async function createWebhookSubscription(data: WebhookSubscriptionData) {
  // Generate a secret if not provided
  const secret = data.secret || crypto.randomBytes(32).toString('hex')

  const subscription = await prisma.webhookSubscription.create({
    data: {
      name: data.name,
      url: data.url,
      events: JSON.stringify(data.events),
      description: data.description || null,
      secret,
      isActive: data.isActive ?? true
    }
  })

  revalidatePath('/admin/webhooks')
  return { ...subscription, events: data.events }
}

export async function updateWebhookSubscription(id: string, data: Partial<WebhookSubscriptionData>) {
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.url !== undefined) updateData.url = data.url
  if (data.events !== undefined) updateData.events = JSON.stringify(data.events)
  if (data.description !== undefined) updateData.description = data.description
  if (data.secret !== undefined) updateData.secret = data.secret
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const subscription = await prisma.webhookSubscription.update({
    where: { id },
    data: updateData
  })

  revalidatePath('/admin/webhooks')
  revalidatePath(`/admin/webhooks/${id}`)
  return { ...subscription, events: JSON.parse(subscription.events) }
}

export async function deleteWebhookSubscription(id: string) {
  await prisma.webhookSubscription.delete({
    where: { id }
  })

  revalidatePath('/admin/webhooks')
}

export async function toggleWebhookSubscription(id: string) {
  const subscription = await prisma.webhookSubscription.findUnique({
    where: { id },
    select: { isActive: true }
  })

  if (!subscription) {
    throw new Error('Suscripcion no encontrada')
  }

  await prisma.webhookSubscription.update({
    where: { id },
    data: { isActive: !subscription.isActive }
  })

  revalidatePath('/admin/webhooks')
}

export async function regenerateSecret(id: string) {
  const newSecret = crypto.randomBytes(32).toString('hex')

  await prisma.webhookSubscription.update({
    where: { id },
    data: { secret: newSecret }
  })

  revalidatePath('/admin/webhooks')
  revalidatePath(`/admin/webhooks/${id}`)

  return newSecret
}

export async function testWebhook(id: string) {
  const subscription = await prisma.webhookSubscription.findUnique({
    where: { id }
  })

  if (!subscription) {
    throw new Error('Suscripcion no encontrada')
  }

  const testPayload = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'Este es un evento de prueba desde OmniPartners',
      subscriptionId: id,
      subscriptionName: subscription.name
    }
  }

  const startTime = Date.now()
  let success = false
  let statusCode: number | null = null
  let responseBody: string | null = null
  let errorMessage: string | null = null

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Add signature if secret exists
    if (subscription.secret) {
      const signature = crypto
        .createHmac('sha256', subscription.secret)
        .update(JSON.stringify(testPayload))
        .digest('hex')
      headers['X-Webhook-Signature'] = signature
    }

    const response = await fetch(subscription.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload)
    })

    statusCode = response.status
    responseBody = await response.text()
    success = response.ok
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    success = false
  }

  const responseTime = Date.now() - startTime

  // Log the test
  await prisma.webhookLog.create({
    data: {
      subscriptionId: id,
      event: 'webhook.test',
      payload: JSON.stringify(testPayload),
      statusCode,
      responseBody: responseBody?.substring(0, 1000) || null,
      responseTime,
      success,
      errorMessage
    }
  })

  // Update subscription stats
  await prisma.webhookSubscription.update({
    where: { id },
    data: {
      lastTriggeredAt: new Date(),
      successCount: success ? { increment: 1 } : undefined,
      failureCount: !success ? { increment: 1 } : undefined
    }
  })

  revalidatePath('/admin/webhooks')
  revalidatePath(`/admin/webhooks/${id}`)

  return {
    success,
    statusCode,
    responseTime,
    errorMessage
  }
}

export async function clearWebhookLogs(subscriptionId: string) {
  await prisma.webhookLog.deleteMany({
    where: { subscriptionId }
  })

  revalidatePath(`/admin/webhooks/${subscriptionId}`)
}

// ============================================
// HELPERS
// ============================================

export function getAllWebhookEventTypes(): { value: string; label: string; category: string }[] {
  return [
    // Partner Events
    { value: WebhookEventType.PARTNER_REGISTERED, label: 'Partner registrado', category: 'Partners' },
    { value: WebhookEventType.PARTNER_APPROVED, label: 'Partner aprobado', category: 'Partners' },
    { value: WebhookEventType.PARTNER_REJECTED, label: 'Partner rechazado', category: 'Partners' },
    { value: WebhookEventType.PARTNER_SUSPENDED, label: 'Partner suspendido', category: 'Partners' },
    { value: WebhookEventType.PARTNER_CERTIFIED, label: 'Partner certificado', category: 'Partners' },

    // Lead Events
    { value: WebhookEventType.LEAD_CREATED, label: 'Lead creado', category: 'Leads' },
    { value: WebhookEventType.LEAD_UPDATED, label: 'Lead actualizado', category: 'Leads' },
    { value: WebhookEventType.LEAD_TO_PROSPECT, label: 'Lead convertido a prospect', category: 'Leads' },
    { value: WebhookEventType.LEAD_TO_CLIENT, label: 'Lead convertido a cliente', category: 'Leads' },

    // Payment Events
    { value: WebhookEventType.PAYMENT_RECEIVED, label: 'Pago recibido', category: 'Pagos' },
    { value: WebhookEventType.COMMISSION_GENERATED, label: 'Comision generada', category: 'Pagos' },
    { value: WebhookEventType.INVOICE_CREATED, label: 'Factura creada', category: 'Pagos' },

    // User Events
    { value: WebhookEventType.USER_INVITED, label: 'Usuario invitado', category: 'Usuarios' },
    { value: WebhookEventType.USER_JOINED, label: 'Usuario unido', category: 'Usuarios' },

    // Requirement Events
    { value: WebhookEventType.REQUIREMENT_COMPLETED, label: 'Requisito completado', category: 'Requisitos' },
    { value: WebhookEventType.ALL_REQUIREMENTS_MET, label: 'Todos los requisitos cumplidos', category: 'Requisitos' },
  ]
}
