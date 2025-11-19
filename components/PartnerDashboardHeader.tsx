'use client'

import Link from 'next/link'
import Logo from './Logo'
import LogoutButton from './LogoutButton'
import LanguageSelector from './LanguageSelector'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface PartnerDashboardHeaderProps {
  userName: string
  companyName: string
}

export default function PartnerDashboardHeader({ userName, companyName }: PartnerDashboardHeaderProps) {
  const { t } = useLanguage()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Logo variant="dark" size="sm" href="/partner" />
            <nav className="hidden md:flex gap-1">
              <Link
                href="/partner"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-omniwallet-primary hover:bg-gray-50 rounded-md transition"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/partner/leads"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-omniwallet-primary hover:bg-gray-50 rounded-md transition"
              >
                {t.partner.myLeads}
              </Link>
              <Link
                href="/partner/commissions"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-omniwallet-primary hover:bg-gray-50 rounded-md transition"
              >
                {t.nav.commissions}
              </Link>
              <Link
                href="/partner/resources"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-omniwallet-primary hover:bg-gray-50 rounded-md transition"
              >
                {t.nav.resources}
              </Link>
              <Link
                href="/partner/team"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-omniwallet-primary hover:bg-gray-50 rounded-md transition"
              >
                {t.nav.team}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden md:block">
              {companyName}
            </span>
            <LanguageSelector />
            <LogoutButton className="text-sm text-gray-600 hover:text-gray-900 transition" />
          </div>
        </div>
      </div>
    </header>
  )
}
