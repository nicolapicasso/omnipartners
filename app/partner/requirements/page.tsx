import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { LeadStatus } from '@/types'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'
import RequirementsContent from './RequirementsContent'
import { getTranslations } from '@/lib/translations'
import { getRequirementsForPartner, DEFAULT_REQUIREMENTS } from '@/app/admin/requirements/actions'

async function getPartnerRequirements(partnerId: string, locale: string) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: {
      contractUrl: true,
      omniwalletAccountUrl: true,
      hasCompletedYearlyEvent: true,
      isCertified: true,
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

  // Get dynamic requirements for this partner
  const reqResult = await getRequirementsForPartner(partnerId)
  const config = reqResult.data || {
    ...DEFAULT_REQUIREMENTS,
    leadsLabel: null,
    prospectsLabel: null,
    clientsLabel: null,
    eventsLabel: null,
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

  const requirements: Array<{
    id: string
    title: string
    description: string
    completed: boolean
    icon: string
    progress?: { current: number; target: number }
  }> = []

  // Contract requirement (if required)
  if (config.contractRequired) {
    requirements.push({
      id: 'contract',
      title: t.requirements?.contract?.title || 'Contract',
      description: t.requirements?.contract?.description || 'Sign the partner contract',
      completed: !!partner.contractUrl,
      icon: 'FileText',
    })
  }

  // Omniwallet account requirement (if required)
  if (config.omniwalletRequired) {
    requirements.push({
      id: 'account',
      title: t.requirements?.account?.title || 'Omniwallet Account',
      description: t.requirements?.account?.description || 'Create your Omniwallet account',
      completed: !!partner.omniwalletAccountUrl,
      icon: 'Wallet',
    })
  }

  // Leads requirement (if > 0)
  if (config.leadsPerYear > 0) {
    requirements.push({
      id: 'leads',
      title: t.requirements?.leads?.title || 'Register Leads',
      description: (t.requirements?.leads?.description || 'Register at least {count} leads this year').replace('{count}', String(config.leadsPerYear)),
      completed: leadsThisYear.length >= config.leadsPerYear,
      progress: { current: leadsThisYear.length, target: config.leadsPerYear },
      icon: 'TrendingUp',
    })
  }

  // Prospects requirement (if > 0)
  if (config.prospectsPerYear > 0) {
    requirements.push({
      id: 'prospects',
      title: t.requirements?.prospects?.title || 'Convert Prospects',
      description: (t.requirements?.prospects?.description || 'Convert at least {count} leads to prospects').replace('{count}', String(config.prospectsPerYear)),
      completed: prospectsThisYear.length >= config.prospectsPerYear,
      progress: { current: prospectsThisYear.length, target: config.prospectsPerYear },
      icon: 'Users',
    })
  }

  // Clients requirement (if > 0)
  if (config.clientsPerYear > 0) {
    requirements.push({
      id: 'clients',
      title: t.requirements?.clients?.title || 'Acquire Clients',
      description: (t.requirements?.clients?.description || 'Convert at least {count} prospects to clients').replace('{count}', String(config.clientsPerYear)),
      completed: clientsThisYear.length >= config.clientsPerYear,
      progress: { current: clientsThisYear.length, target: config.clientsPerYear },
      icon: 'CheckCircle2',
    })
  }

  // Events requirement (if > 0)
  if (config.eventsPerYear > 0) {
    requirements.push({
      id: 'event',
      title: t.requirements?.event?.title || 'Yearly Event',
      description: t.requirements?.event?.description || 'Attend the yearly partner event',
      completed: partner.hasCompletedYearlyEvent,
      icon: 'Presentation',
    })
  }

  // Certification requirement (if required)
  if (config.certificationRequired) {
    requirements.push({
      id: 'certification',
      title: t.requirements?.certification?.title || 'Certification',
      description: t.requirements?.certification?.description || 'Complete the partner certification',
      completed: partner.isCertified,
      icon: 'Award',
    })
  }

  const completedCount = requirements.filter((r) => r.completed).length
  const completionPercentage = requirements.length > 0
    ? Math.round((completedCount / requirements.length) * 100)
    : 100

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
