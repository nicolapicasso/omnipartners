'use client'

import { Info, Target, Calendar, CheckCircle } from 'lucide-react'

export default function LeadStatusLegend() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-blue-900">Lead Status Guide</h3>
      </div>
      <div className="space-y-2 ml-7">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium text-gray-900 text-sm">Lead:</span>
            <span className="text-gray-700 text-sm ml-1">Initial contact or potential client who has shown interest.</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium text-gray-900 text-sm">Prospect:</span>
            <span className="text-gray-700 text-sm ml-1">Qualified lead who has received a product demo or presentation.</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium text-gray-900 text-sm">Client:</span>
            <span className="text-gray-700 text-sm ml-1">Active customer who has signed a contract and generates revenue.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
