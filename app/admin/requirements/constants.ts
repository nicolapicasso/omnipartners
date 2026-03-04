// ============================================
// PARTNER REQUIREMENTS CONSTANTS
// ============================================

export type RequirementConfig = {
  id: string
  scope: string
  partnerCategory: string | null
  partnerId: string | null
  leadsPerYear: number
  prospectsPerYear: number
  clientsPerYear: number
  eventsPerYear: number
  certificationRequired: boolean
  contractRequired: boolean
  omniwalletRequired: boolean
  leadsLabel: string | null
  prospectsLabel: string | null
  clientsLabel: string | null
  eventsLabel: string | null
}

// Default values when no config exists
export const DEFAULT_REQUIREMENTS = {
  leadsPerYear: 10,
  prospectsPerYear: 5,
  clientsPerYear: 2,
  eventsPerYear: 1,
  certificationRequired: true,
  contractRequired: true,
  omniwalletRequired: true,
}
