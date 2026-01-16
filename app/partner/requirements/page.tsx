import { cookies } from 'next/headers'
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
      title: t.requirements?.contract?.title || 'Contract',
      description: t.requirements?.contract?.description || 'Sign the partner contract',
      completed: !!partner.contractUrl,
      icon: 'FileText',
    },
    {
      id: 'account',
      title: t.requirements?.account?.title || 'Omniwallet Account',
      description: t.requirements?.account?.description || 'Create your Omniwallet account',
      completed: !!partner.omniwalletAccountUrl,
      icon: 'Wallet',
    },
    {
      id: 'leads',
      title: t.requirements?.leads?.title || 'Register Leads',
      description: t.requirements?.leads?.description || 'Register at least 10 leads this year',
      completed: leadsThisYear.length >= 10,
      progress: { current: leadsThisYear.length, target: 10 },
      icon: 'TrendingUp',
    },
    {
      id: 'prospects',
      title: t.requirements?.prospects?.title || 'Convert Prospects',
      description: t.requirements?.prospects?.description || 'Convert at least 5 leads to prospects',
      completed: prospectsThisYear.length >= 5,
      progress: { current: prospectsThisYear.length, target: 5 },
      icon: 'Users',
    },
    {
      id: 'clients',
      title: t.requirements?.clients?.title || 'Acquire Clients',
      description: t.requirements?.clients?.description || 'Convert at least 2 prospects to clients',
      completed: clientsThisYear.length >= 2,
      progress: { current: clientsThisYear.length, target: 2 },
      icon: 'CheckCircle2',
    },
    {
      id: 'event',
      title: t.requirements?.event?.title || 'Yearly Event',
      description: t.requirements?.event?.description || 'Attend the yearly partner event',
      completed: partner.hasCompletedYearlyEvent,
      icon: 'Presentation',
    },
  ]

  const completedCount = requirements.filter((r) => r.completed).length
  const completionPercentage = Math.round((completedCount / requirements.length) * 100)

  return { requirements, completedCount, totalCount: requirements.length, completionPercentage }
}

export default async function RequirementsPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!
  const cookieStore = await cookies()
  const locale = cookieStore.get('language')?.value || 'es'

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  })

  if (!partner) {
    return <div>Partner no encontrado</div>
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
      <PartnerSidebar canHaveAffiliates={partner.canHaveAffiliates} />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
