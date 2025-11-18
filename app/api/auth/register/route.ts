import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerPartnerSchema } from '@/lib/validations'
import { PartnerStatus, PartnerCategory, NotificationType } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerPartnerSchema.parse(body)

    // Check if email already exists
    const existingPartner = await prisma.partner.findUnique({
      where: { email: validatedData.email },
    })

    if (existingPartner) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create partner
    const partner = await prisma.partner.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        companyName: validatedData.companyName,
        contactName: validatedData.contactName,
        phone: validatedData.phone,
        country: validatedData.country,
        website: validatedData.website || undefined,
        address: validatedData.address,
        status: PartnerStatus.PENDING,
        partnerCategory: PartnerCategory.REFERRAL,
        role: 'PARTNER_OWNER',
      },
    })

    // Create notification for admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    })

    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: NotificationType.PARTNER_REGISTERED,
            title: 'Nuevo Partner Registrado',
            message: `${partner.companyName} se ha registrado y está pendiente de aprobación`,
            metadata: JSON.stringify({
              partnerId: partner.id,
              partnerEmail: partner.email,
              companyName: partner.companyName,
            }),
          },
        })
      )
    )

    // TODO: Send email notification to admins (Hubspot integration)

    return NextResponse.json(
      {
        message: 'Registro exitoso. Tu solicitud está pendiente de aprobación.',
        partner: {
          id: partner.id,
          email: partner.email,
          companyName: partner.companyName,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de registro inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al registrar. Intenta nuevamente.' },
      { status: 500 }
    )
  }
}
