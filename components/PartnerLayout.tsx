'use client'

import { ReactNode } from 'react'
import PartnerDashboardHeader from './PartnerDashboardHeader'
import PartnerSidebar from './PartnerSidebar'

interface PartnerLayoutProps {
  children: ReactNode
  userName: string
  companyName: string
}

export default function PartnerLayout({ children, userName, companyName }: PartnerLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader userName={userName} companyName={companyName} />
      <PartnerSidebar />
      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </div>
  )
}
