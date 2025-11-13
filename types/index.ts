import { Partner, PartnerStatus, PartnerType } from '@prisma/client'

export type { Partner, PartnerStatus, PartnerType }

export interface DashboardStats {
  activePartners: number
  pendingPartners: number
  leads: number
  clients: number
}
