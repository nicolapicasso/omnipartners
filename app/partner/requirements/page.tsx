import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { LeadStatus } from '@/types'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'
import RequirementsContent from './RequirementsContent'
import { getTranslations } from '@/lib/translations'

async function getPartnerRequirements(partnerId: string, locale: string) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: {
      contractUrl: true,
      omniwalletAccountUrl: true,
      hasCompletedYearlyEvent: true,
      leads: {
        select: {
          status: true,
          createdAt: true,
        },
      },
    },
  })

  if (!partner) {
    throw new Error('Partner not found')
  }

  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59)

  // Count leads created this year
  const leadsThisYear = partner.leads.filter(
    (lead) => lead.createdAt >= startOfYear && lead.createdAt <= endOfYear
  )

  const prospectsThisYear = leadsThisYear.filter((lead) => lead.status === LeadStatus.PROSPECT || lead.status === LeadStatus.CLIENT)
  const clientsThisYear = leadsThisYear.filter((lead) => lead.status === LeadStatus.CLIENT)

  const t = getTranslations(locale)

  const requirements = [
    {
      id: 'contract',
      title: t.requirements.contract.title,
      description: t.requirements.contract.description,
      completed: !!partner.contractUrl,
      icon: 'FileText',
    },
    {
      id: 'account',
      title: t.requirements.account.title,
      description: t.requirements.account.description,
      completed: !!partner.omniwalletAccountUrl,
      icon: 'Wallet',
    },
    {
      id: 'leads',
      title: t.requirements.leads.title,
      description: t.requirements.leads.description,
      completed: leadsThisYear.length >= 10,
      progress: { current: leadsThisYear.length, target: 10 },
      icon: 'TrendingUp',
    },
    {
      id: 'prospects',
      title: t.requirements.prospects.title,
      description: t.requirements.prospects.description,
      completed: prospectsThisYear.length >= 5,
      progress: { current: prospectsThisYear.length, target: 5 },
      icon: 'Users',
    },
    {
      id: 'clients',
      title: t.requirements.clients.title,
      description: t.requirements.clients.description,
      completed: clientsThisYear.length >= 2,
      progress: { current: clientsThisYear.length, target: 2 },
      icon: 'CheckCircle2',
    },
    {
      id: 'event',
      title: t.requirements.event.title,
      description: t.requirements.event.description,
      completed: partner.hasCompletedYearlyEvent,
      icon: 'Presentation',
    },
  ]

  const completedCount = requirements.filter((r) => r.completed).length
  const completionPercentage = Math.round((completedCount / requirements.length) * 100)

  return { requirements, completedCount, totalCount: requirements.length, completionPercentage }
}

export default async function RequirementsPage({
  params,
}: {
  params: Promise<{ locale?: string }>
}) {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!
  const resolvedParams = await params
  const locale = resolvedParams?.locale || 'en'

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  })

  if (!partner) {
    return <div>Partner not found</div>
  }

  const { requirements, completedCount, totalCount, completionPercentage } =
    await getPartnerRequirements(partnerId, locale)

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar />

      <main className="ml-64 pt-20 px-8 py-8">
        <RequirementsContent
          requirements={requirements}
          completedCount={completedCount}
          totalCount={totalCount}
          completionPercentage={completionPercentage}
          currentYear={currentYear}
        />
      </main>
    </div>
  )
}
