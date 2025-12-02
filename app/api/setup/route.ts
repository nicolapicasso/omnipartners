'use server'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// This endpoint initializes the database schema and creates the admin user
// It should only be called once during initial setup
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  // Simple protection - require a secret key
  if (secret !== process.env.NEXTAUTH_SECRET?.substring(0, 16)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First, try to fix permissions for PostgreSQL 15+
    try {
      await prisma.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO CURRENT_USER;`)
    } catch {
      // Ignore if this fails - we'll try to create tables anyway
    }

    try {
      await prisma.$executeRawUnsafe(`GRANT CREATE ON SCHEMA public TO CURRENT_USER;`)
    } catch {
      // Ignore
    }

    try {
      await prisma.$executeRawUnsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO CURRENT_USER;`)
    } catch {
      // Ignore
    }

    // Create all tables using raw SQL
    await prisma.$executeRawUnsafe(`
      -- Partners table
      CREATE TABLE IF NOT EXISTS "partners" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "companyName" TEXT NOT NULL,
        "contactName" TEXT NOT NULL,
        "phone" TEXT,
        "country" TEXT NOT NULL,
        "website" TEXT,
        "address" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "partnerCategory" TEXT NOT NULL DEFAULT 'REFERRAL',
        "role" TEXT NOT NULL DEFAULT 'PARTNER_OWNER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "approvedAt" TIMESTAMP(3),
        "contractUrl" TEXT,
        "omniwalletAccountUrl" TEXT,
        "hasCompletedYearlyEvent" BOOLEAN NOT NULL DEFAULT false,
        "isCertified" BOOLEAN NOT NULL DEFAULT false,
        "certifiedAt" TIMESTAMP(3)
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Users table
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "partnerId" TEXT REFERENCES "partners"("id") ON DELETE CASCADE,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastLoginAt" TIMESTAMP(3)
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Leads table
      CREATE TABLE IF NOT EXISTS "leads" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "companyName" TEXT NOT NULL,
        "contactName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "country" TEXT NOT NULL,
        "website" TEXT,
        "status" TEXT NOT NULL DEFAULT 'LEAD',
        "commissionType" TEXT NOT NULL DEFAULT 'REFERRAL',
        "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "partnerId" TEXT NOT NULL REFERENCES "partners"("id") ON DELETE CASCADE,
        "createdById" TEXT REFERENCES "users"("id"),
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "convertedAt" TIMESTAMP(3)
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Payments table
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "leadId" TEXT NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
        "amount" DOUBLE PRECISION NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'EUR',
        "paymentDate" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "commissionAmount" DOUBLE PRECISION NOT NULL,
        "externalReference" TEXT,
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Invoices table
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "partnerId" TEXT NOT NULL REFERENCES "partners"("id") ON DELETE CASCADE,
        "invoiceNumber" TEXT NOT NULL UNIQUE,
        "periodMonth" INTEGER NOT NULL,
        "periodYear" INTEGER NOT NULL,
        "totalAmount" DOUBLE PRECISION NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'EUR',
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "pdfUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "sentAt" TIMESTAMP(3),
        "paidAt" TIMESTAMP(3)
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Invoice Payments table
      CREATE TABLE IF NOT EXISTS "invoice_payments" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "invoiceId" TEXT NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
        "paymentId" TEXT NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("invoiceId", "paymentId")
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Contents table
      CREATE TABLE IF NOT EXISTS "contents" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "type" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "fileUrl" TEXT,
        "externalUrl" TEXT,
        "tags" TEXT,
        "fileSize" INTEGER,
        "mimeType" TEXT,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "isFeatured" BOOLEAN NOT NULL DEFAULT false,
        "order" INTEGER NOT NULL DEFAULT 0,
        "viewCount" INTEGER NOT NULL DEFAULT 0,
        "downloadCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Content Views table
      CREATE TABLE IF NOT EXISTS "content_views" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "contentId" TEXT NOT NULL REFERENCES "contents"("id") ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "downloaded" BOOLEAN NOT NULL DEFAULT false,
        "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Content Favorites table
      CREATE TABLE IF NOT EXISTS "content_favorites" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "contentId" TEXT NOT NULL REFERENCES "contents"("id") ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("contentId", "userId")
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Notifications table
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT REFERENCES "users"("id") ON DELETE CASCADE,
        "partnerId" TEXT REFERENCES "partners"("id") ON DELETE CASCADE,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "readAt" TIMESTAMP(3),
        "metadata" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Certification Contents table
      CREATE TABLE IF NOT EXISTS "certification_contents" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "description" TEXT,
        "type" TEXT NOT NULL,
        "url" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isPublished" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Certification Questions table
      CREATE TABLE IF NOT EXISTS "certification_questions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "question" TEXT NOT NULL,
        "options" TEXT NOT NULL,
        "correctAnswer" INTEGER NOT NULL,
        "explanation" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Certification Attempts table
      CREATE TABLE IF NOT EXISTS "certification_attempts" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "partnerId" TEXT NOT NULL REFERENCES "partners"("id") ON DELETE CASCADE,
        "totalQuestions" INTEGER NOT NULL,
        "correctAnswers" INTEGER NOT NULL,
        "score" DOUBLE PRECISION NOT NULL,
        "passed" BOOLEAN NOT NULL,
        "answers" TEXT NOT NULL,
        "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Webhook Subscriptions table
      CREATE TABLE IF NOT EXISTS "webhook_subscriptions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "events" TEXT NOT NULL,
        "secret" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "description" TEXT,
        "lastTriggeredAt" TIMESTAMP(3),
        "successCount" INTEGER NOT NULL DEFAULT 0,
        "failureCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Webhook Logs table
      CREATE TABLE IF NOT EXISTS "webhook_logs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "subscriptionId" TEXT NOT NULL REFERENCES "webhook_subscriptions"("id") ON DELETE CASCADE,
        "event" TEXT NOT NULL,
        "payload" TEXT NOT NULL,
        "statusCode" INTEGER,
        "responseBody" TEXT,
        "responseTime" INTEGER,
        "success" BOOLEAN NOT NULL,
        "errorMessage" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Check if admin exists
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminExists) {
      // Create admin user
      const hashedPassword = await hashPassword('admin123')
      await prisma.user.create({
        data: {
          id: 'admin-' + Date.now(),
          email: 'admin@omniwallet.com',
          password: hashedPassword,
          name: 'Admin',
          role: 'ADMIN',
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully!',
      adminCreated: !adminExists,
      credentials: !adminExists ? {
        email: 'admin@omniwallet.com',
        password: 'admin123'
      } : 'Admin already exists'
    })

  } catch (error: unknown) {
    console.error('Setup error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
