import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { UserRole } from '@/types'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        // Try to find user in User table first (for Admin and Partner Users)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { partner: true },
        })

        if (user) {
          const isValid = await verifyPassword(credentials.password, user.password)

          if (!isValid) {
            throw new Error('Contraseña incorrecta')
          }

          if (!user.isActive) {
            throw new Error('Usuario inactivo. Contacta al administrador.')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            partnerId: user.partnerId,
            partnerName: user.partner?.companyName,
          }
        }

        // If not found, try Partner table (for Partner Owners)
        const partner = await prisma.partner.findUnique({
          where: { email: credentials.email },
        })

        if (partner) {
          const isValid = await verifyPassword(credentials.password, partner.password)

          if (!isValid) {
            throw new Error('Contraseña incorrecta')
          }

          if (partner.status !== 'ACTIVE') {
            if (partner.status === 'PENDING') {
              throw new Error('Tu solicitud está pendiente de aprobación')
            }
            throw new Error('Tu cuenta no está activa. Contacta al administrador.')
          }

          return {
            id: partner.id,
            email: partner.email,
            name: partner.contactName,
            role: 'PARTNER_OWNER',
            partnerId: partner.id,
            partnerName: partner.companyName,
            partnerCategory: partner.partnerCategory,
          }
        }

        throw new Error('Usuario no encontrado')
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.partnerId = user.partnerId
        token.partnerName = user.partnerName
        token.partnerCategory = user.partnerCategory
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.partnerId = token.partnerId as string | null
        session.user.partnerName = token.partnerName as string | undefined
        session.user.partnerCategory = token.partnerCategory as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
