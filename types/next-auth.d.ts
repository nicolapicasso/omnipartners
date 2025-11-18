import { UserRole } from './index'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    partnerId?: string | null
    partnerName?: string
    partnerCategory?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      partnerId?: string | null
      partnerName?: string
      partnerCategory?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    partnerId?: string | null
    partnerName?: string
    partnerCategory?: string
  }
}
