'use client'

import Link from 'next/link'
import Logo from './Logo'
import LogoutButton from './LogoutButton'
import LanguageSelector from './LanguageSelector'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface AdminDashboardHeaderProps {
  userName: string
}

export default function AdminDashboardHeader({ userName }: AdminDashboardHeaderProps) {
  const { t } = useLanguage()

  return (
    <header className="bg-omniwallet-primary text-white shadow-lg">
      <div className="container mx-auto px-6 py-6">
        <div className="mb-4 flex justify-between items-center">
          <Logo variant="light" size="md" href="/admin" />
          <LanguageSelector />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t.admin.title}</h1>
            <p className="text-omniwallet-light mt-2">
              {t.common.welcome}, {userName}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/partners"
              className="bg-white text-omniwallet-primary px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-light transition"
            >
              {t.admin.managePartners}
            </Link>
            <Link
              href="/admin/leads"
              className="bg-omniwallet-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              {t.admin.manageLeads}
            </Link>
            <Link
              href="/admin/content"
              className="bg-white text-omniwallet-primary px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-light transition"
            >
              {t.nav.content}
            </Link>
            <LogoutButton className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2" />
          </div>
        </div>
      </div>
    </header>
  )
}
