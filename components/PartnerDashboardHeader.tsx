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
    <header className="bg-omniwallet-primary text-white shadow-lg">
      <div className="container mx-auto px-6 py-6">
        <div className="mb-4 flex justify-between items-center">
          <Logo variant="light" size="md" href="/partner" />
          <LanguageSelector />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t.partner.title}</h1>
            <p className="text-omniwallet-light mt-2">
              {t.common.welcome}, {userName} - {companyName}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/partner/leads"
              className="bg-white text-omniwallet-primary px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-light transition"
            >
              {t.partner.myLeads}
            </Link>
            <Link
              href="/partner/commissions"
              className="bg-white text-omniwallet-primary px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-light transition"
            >
              {t.nav.commissions}
            </Link>
            <Link
              href="/partner/resources"
              className="bg-white text-omniwallet-primary px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-light transition"
            >
              {t.nav.resources}
            </Link>
            <Link
              href="/partner/team"
              className="bg-omniwallet-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              {t.nav.team}
            </Link>
            <LogoutButton className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2" />
          </div>
        </div>
      </div>
    </header>
  )
}
