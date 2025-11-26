'use client'

import { CheckCircle2, Circle, FileText, Wallet, TrendingUp, Users, Presentation, Calendar, LucideIcon } from 'lucide-react'
import { useTranslation } from '@/lib/contexts/LanguageContext'

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Wallet,
  TrendingUp,
  Users,
  CheckCircle2,
  Presentation,
}

interface Requirement {
  id: string
  title: string
  description: string
  completed: boolean
  progress?: { current: number; target: number }
  icon: string
}

interface RequirementsContentProps {
  requirements: Requirement[]
  completedCount: number
  totalCount: number
  completionPercentage: number
  currentYear: number
}

export default function RequirementsContent({
  requirements,
  completedCount,
  totalCount,
  completionPercentage,
  currentYear,
}: RequirementsContentProps) {
  const { t } = useTranslation()

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8 text-omniwallet-primary" />
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('requirements.title')} {currentYear}
          </h1>
        </div>
        <p className="text-gray-600">{t('requirements.subtitle')}</p>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-gradient-to-br from-omniwallet-primary to-omniwallet-secondary rounded-lg shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('requirements.overallProgress')}</h2>
            <p className="text-white/90">
              {completedCount} {t('common.of')} {totalCount} {t('requirements.requirementsCompleted')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{completionPercentage}%</div>
            <p className="text-white/90 text-sm">{t('requirements.complete')}</p>
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
            <p className="font-semibold">{t('requirements.congratulations')}</p>
          </div>
        )}
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {requirements.map((requirement) => {
          const Icon = iconMap[requirement.icon] || FileText
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
                      requirement.completed ? 'bg-green-100' : 'bg-gray-100'
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
                          {t('requirements.completed')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          <Circle className="w-4 h-4" />
                          {t('requirements.inProgress')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar for numeric requirements */}
                  {requirement.progress && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {t('requirements.progress')}: {requirement.progress.current} /{' '}
                          {requirement.progress.target}
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
      <div className="mt-8 bg-omniwallet-primary/10 border border-omniwallet-primary/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('requirements.helpTitle')}
        </h3>
        <p className="text-sm text-gray-700 mb-3">{t('requirements.helpDescription')}</p>
        <a
          href="mailto:partners@omniwallet.com"
          className="inline-flex items-center gap-2 text-omniwallet-primary hover:text-omniwallet-secondary font-medium text-sm"
        >
          {t('requirements.contactSupport')} →
        </a>
      </div>
    </>
  )
}
