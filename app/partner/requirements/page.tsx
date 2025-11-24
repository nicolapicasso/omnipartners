import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { LeadStatus } from '@/types'
import { CheckCircle2, Circle, FileText, Wallet, TrendingUp, Users, Presentation, Calendar } from 'lucide-react'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'

interface Requirement {
  id: string
  title: string
  description: string
  completed: boolean
  progress?: { current: number; target: number }
  icon: any
}

async function getPartnerRequirements(partnerId: string) {
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

  const prospectsThisYear = leadsThisYear.filter((lead) => lead.status === LeadStatus.PROSPECT)
  const clientsThisYear = leadsThisYear.filter((lead) => lead.status === LeadStatus.CLIENT)

  const requirements: Requirement[] = [
    {
      id: 'contract',
      title: 'Sign Partnership Contract',
      description: 'Review and sign the official partnership agreement with Omniwallet',
      completed: !!partner.contractUrl,
      icon: FileText,
    },
    {
      id: 'account',
      title: 'Omniwallet Partner Account',
      description: 'Have an active Omniwallet partner account configured',
      completed: !!partner.omniwalletAccountUrl,
      icon: Wallet,
    },
    {
      id: 'leads',
      title: 'Create 10+ Leads per Year',
      description: 'Generate at least 10 quality leads for Omniwallet annually',
      completed: leadsThisYear.length >= 10,
      progress: { current: leadsThisYear.length, target: 10 },
      icon: TrendingUp,
    },
    {
      id: 'prospects',
      title: 'Convert 5+ Leads to Prospects',
      description: 'Have at least 5 leads receive product demonstrations annually',
      completed: prospectsThisYear.length >= 5,
      progress: { current: prospectsThisYear.length, target: 5 },
      icon: Users,
    },
    {
      id: 'clients',
      title: 'Close 2+ Clients per Year',
      description: 'Successfully convert at least 2 prospects into paying clients annually',
      completed: clientsThisYear.length >= 2,
      progress: { current: clientsThisYear.length, target: 2 },
      icon: CheckCircle2,
    },
    {
      id: 'event',
      title: 'Host/Attend Joint Event',
      description: 'Participate in at least one webinar or joint event with Omniwallet per year',
      completed: partner.hasCompletedYearlyEvent,
      icon: Presentation,
    },
  ]

  const completedCount = requirements.filter((r) => r.completed).length
  const completionPercentage = Math.round((completedCount / requirements.length) * 100)

  return { requirements, completedCount, totalCount: requirements.length, completionPercentage }
}

export default async function RequirementsPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  })

  if (!partner) {
    return <div>Partner not found</div>
  }

  const { requirements, completedCount, totalCount, completionPercentage } =
    await getPartnerRequirements(partnerId)

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar />

      <main className="ml-64 pt-20 px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-omniwallet-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Partner Requirements {currentYear}</h1>
          </div>
          <p className="text-gray-600">
            Track your progress towards meeting Omniwallet partner program requirements
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-gradient-to-br from-omniwallet-primary to-omniwallet-secondary rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall Progress</h2>
              <p className="text-white/90">
                {completedCount} of {totalCount} requirements completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{completionPercentage}%</div>
              <p className="text-white/90 text-sm">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {completionPercentage === 100 && (
            <div className="mt-4 p-3 bg-white/20 rounded-lg text-center">
              <p className="font-semibold">🎉 Congratulations! You've met all partner requirements!</p>
            </div>
          )}
        </div>

        {/* Requirements List */}
        <div className="space-y-4">
          {requirements.map((requirement) => {
            const Icon = requirement.icon
            return (
              <div
                key={requirement.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all ${
                  requirement.completed
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon and Status */}
                  <div className="flex-shrink-0">
                    <div
                      className={`p-3 rounded-lg ${
                        requirement.completed
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          requirement.completed ? 'text-green-600' : 'text-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {requirement.title}
                        </h3>
                        <p className="text-sm text-gray-600">{requirement.description}</p>
                      </div>
                      <div className="ml-4">
                        {requirement.completed ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                            <Circle className="w-4 h-4" />
                            In Progress
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for numeric requirements */}
                    {requirement.progress && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progress: {requirement.progress.current} / {requirement.progress.target}
                          </span>
                          <span className="text-sm text-gray-600">
                            {Math.round(
                              (requirement.progress.current / requirement.progress.target) * 100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              requirement.completed ? 'bg-green-600' : 'bg-omniwallet-primary'
                            }`}
                            style={{
                              width: `${Math.min(
                                (requirement.progress.current / requirement.progress.target) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-700 mb-3">
            If you have questions about any requirements or need assistance, please contact your
            Omniwallet partnership manager or reach out to our support team.
          </p>
          <a
            href="mailto:partners@omniwallet.com"
            className="inline-flex items-center gap-2 text-omniwallet-primary hover:text-omniwallet-secondary font-medium text-sm"
          >
            Contact Support →
          </a>
        </div>
      </main>
    </div>
  )
}
