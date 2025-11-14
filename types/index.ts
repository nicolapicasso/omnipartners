import { Partner } from '@prisma/client'

export type { Partner }

// Enums for type safety (since SQLite doesn't support native enums)
export enum PartnerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum PartnerType {
  LEAD = 'LEAD',
  CLIENT = 'CLIENT',
}

export interface DashboardStats {
  activePartners: number
  pendingPartners: number
  leads: number
  clients: number
}
