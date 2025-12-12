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
