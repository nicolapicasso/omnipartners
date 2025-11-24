'use client'

import Logo from './Logo'
import LogoutButton from './LogoutButton'
import LanguageSelector from './LanguageSelector'

interface PartnerDashboardHeaderProps {
  userName: string
  companyName: string
}

export default function PartnerDashboardHeader({ userName, companyName }: PartnerDashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <Logo variant="dark" size="sm" href="/partner" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">
              {companyName}
            </span>
            <LanguageSelector />
            <LogoutButton className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition" />
          </div>
        </div>
      </div>
    </header>
  )
}
