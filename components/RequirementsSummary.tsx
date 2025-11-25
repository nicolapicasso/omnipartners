'use client'

import { LeadStatus } from '@/types'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/contexts/LanguageContext'

interface RequirementsSummaryProps {
  contractUrl: string | null
  omniwalletAccountUrl: string | null
  hasCompletedYearlyEvent: boolean
  leads: Array<{ status: string; createdAt: Date }>
}

export default function RequirementsSummary({
  contractUrl,
  omniwalletAccountUrl,
  hasCompletedYearlyEvent,
  leads,
}: RequirementsSummaryProps) {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59)

  // Count leads created this year
  const leadsThisYear = leads.filter(
    (lead) => lead.createdAt >= startOfYear && lead.createdAt <= endOfYear
  )

  const prospectsThisYear = leadsThisYear.filter(
    (lead) => lead.status === LeadStatus.PROSPECT || lead.status === LeadStatus.CLIENT
  )
  const clientsThisYear = leadsThisYear.filter((lead) => lead.status === LeadStatus.CLIENT)

  const requirements = [
    { title: t('requirements.contract.title'), completed: !!contractUrl },
    { title: t('requirements.account.title'), completed: !!omniwalletAccountUrl },
    { title: t('requirements.leads.title'), completed: leadsThisYear.length >= 10 },
    { title: t('requirements.prospects.title'), completed: prospectsThisYear.length >= 5 },
    { title: t('requirements.clients.title'), completed: clientsThisYear.length >= 2 },
    { title: t('requirements.event.title'), completed: hasCompletedYearlyEvent },
  ]

  const completedCount = requirements.filter((r) => r.completed).length
  const completionPercentage = Math.round((completedCount / requirements.length) * 100)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {t('requirements.title')} {currentYear}
        </h3>
        <Link
          href="/partner/requirements"
          className="text-sm text-omniwallet-primary hover:text-omniwallet-secondary font-medium flex items-center gap-1"
        >
          {t('dashboard.viewAll')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {completedCount} {t('common.of')} {requirements.length} {t('requirements.completed').toLowerCase()}
          </span>
          <span className="text-sm font-bold text-omniwallet-primary">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-omniwallet-primary to-omniwallet-secondary h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Grid */}
      <div className="grid grid-cols-2 gap-3">
        {requirements.map((requirement, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 p-2.5 rounded-lg ${
              requirement.completed ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            {requirement.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            <span
              className={`text-xs font-medium ${
                requirement.completed ? 'text-green-700' : 'text-gray-600'
              }`}
            >
              {requirement.title}
            </span>
          </div>
        ))}
      </div>

      {completionPercentage === 100 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center">
          <p className="text-sm font-semibold text-green-700">{t('requirements.congratulations')}</p>
        </div>
      )}
    </div>
  )
}
