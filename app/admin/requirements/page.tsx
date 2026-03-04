import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'
import RequirementsManagement from './RequirementsManagement'

export default async function AdminRequirementsPage() {
  const session = await getAdminSession()

  // Fetch all requirement configs
  const configs = await prisma.partnerRequirementConfig.findMany({
    orderBy: [
      { scope: 'asc' },
      { partnerCategory: 'asc' },
    ],
  })

  // Get global config or null
  const globalConfig = configs.find(c => c.scope === 'GLOBAL') || null

  // Get category configs
  const categoryConfigs = configs.filter(c => c.scope === 'BY_CATEGORY')

  // Get partner overrides with partner info
  const partnerOverrides = await prisma.partnerRequirementConfig.findMany({
    where: { scope: 'BY_PARTNER' },
  })

  // Get partner names for overrides
  const partnerIds = partnerOverrides.map(p => p.partnerId).filter(Boolean) as string[]
  const partners = await prisma.partner.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, companyName: true, partnerCategory: true },
  })

  const overridesWithPartnerInfo = partnerOverrides.map(override => ({
    ...override,
    partner: partners.find(p => p.id === override.partnerId) || null,
  }))

  // Get all active partners for the override dropdown
  const allPartners = await prisma.partner.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, companyName: true, partnerCategory: true },
    orderBy: { companyName: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <RequirementsManagement
          globalConfig={globalConfig}
          categoryConfigs={categoryConfigs}
          partnerOverrides={overridesWithPartnerInfo}
          allPartners={allPartners}
        />
      </main>
    </div>
  )
}
