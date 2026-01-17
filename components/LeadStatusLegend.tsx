'use client'

import { Info, Target, Calendar, CheckCircle, Archive } from 'lucide-react'
import { useTranslation } from '@/lib/contexts/LanguageContext'

export default function LeadStatusLegend() {
  const { t } = useTranslation()

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-blue-900">{t('leadStatusGuide.title')}</h3>
      </div>
      <div className="space-y-2 ml-7">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium text-gray-900 text-sm">{t('statusLabels.lead')}:</span>
            <span className="text-gray-700 text-sm ml-1">{t('leadStatusGuide.leadDescription')}</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium text-gray-900 text-sm">{t('statusLabels.prospect')}:</span>
            <span className="text-gray-700 text-sm ml-1">{t('leadStatusGuide.prospectDescription')}</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium text-gray-900 text-sm">{t('statusLabels.client')}:</span>
            <span className="text-gray-700 text-sm ml-1">{t('leadStatusGuide.clientDescription')}</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Archive className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium text-gray-900 text-sm">{t('statusLabels.archived')}:</span>
            <span className="text-gray-700 text-sm ml-1">{t('leadStatusGuide.archivedDescription')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
