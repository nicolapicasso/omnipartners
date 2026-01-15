'use server'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// This endpoint runs pending migrations
// Call: GET /api/migrate?secret=<first 16 chars of NEXTAUTH_SECRET>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  // Simple protection - require a secret key
  if (secret !== process.env.NEXTAUTH_SECRET?.substring(0, 16)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    // Migration: Add phoneCountryCode to leads
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "phoneCountryCode" TEXT;
      `)
      results.push('Added phoneCountryCode to leads')
    } catch (e) {
      results.push(`phoneCountryCode: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Add jobTitle to leads
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "jobTitle" TEXT;
      `)
      results.push('Added jobTitle to leads')
    } catch (e) {
      results.push(`jobTitle: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Create contacts table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "contacts" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "leadId" TEXT NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT,
          "phoneCountryCode" TEXT,
          "jobTitle" TEXT,
          "isPrimary" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `)
      results.push('Created contacts table')
    } catch (e) {
      results.push(`contacts table: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Create lead_notes table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "lead_notes" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "leadId" TEXT NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
          "userId" TEXT REFERENCES "users"("id"),
          "partnerId" TEXT,
          "authorName" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `)
      results.push('Created lead_notes table')
    } catch (e) {
      results.push(`lead_notes table: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Add coverImageUrl to contents
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "contents" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
      `)
      results.push('Added coverImageUrl to contents')
    } catch (e) {
      results.push(`coverImageUrl: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Add certificationExpiresAt to partners
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "certificationExpiresAt" TIMESTAMP(3);
      `)
      results.push('Added certificationExpiresAt to partners')
    } catch (e) {
      results.push(`certificationExpiresAt: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Add partnerLandingUrl to partners
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "partnerLandingUrl" TEXT;
      `)
      results.push('Added partnerLandingUrl to partners')
    } catch (e) {
      results.push(`partnerLandingUrl: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Create certification_settings table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "certification_settings" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "badgeLightUrl" TEXT,
          "badgeDarkUrl" TEXT,
          "badgeHoverText" TEXT,
          "badgeAltText" TEXT,
          "validityMonths" INTEGER NOT NULL DEFAULT 12,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `)
      results.push('Created certification_settings table')
    } catch (e) {
      results.push(`certification_settings table: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Add canHaveAffiliates to partners
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "canHaveAffiliates" BOOLEAN NOT NULL DEFAULT false;
      `)
      results.push('Added canHaveAffiliates to partners')
    } catch (e) {
      results.push(`canHaveAffiliates: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Add parentPartnerId to partners (for affiliate relationship)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "parentPartnerId" TEXT REFERENCES "partners"("id");
      `)
      results.push('Added parentPartnerId to partners')
    } catch (e) {
      results.push(`parentPartnerId: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Add affiliateCommission to partners
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "affiliateCommission" DOUBLE PRECISION;
      `)
      results.push('Added affiliateCommission to partners')
    } catch (e) {
      results.push(`affiliateCommission: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    // Migration: Add commissionRate to partners
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
      `)
      results.push('Added commissionRate to partners')
    } catch (e) {
      results.push(`commissionRate: ${e instanceof Error ? e.message : 'already exists or error'}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Migrations completed',
      results
    })

  } catch (error: unknown) {
    console.error('Migration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMessage,
      results
    }, { status: 500 })
  }
}
