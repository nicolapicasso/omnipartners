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
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Logo variant="dark" size="sm" href="/admin" />
            <nav className="hidden md:flex gap-1">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-omniwallet-primary hover:bg-gray-50 rounded-md transition"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/admin/partners"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-omniwallet-primary hover:bg-gray-50 rounded-md transition"
              >
                {t.admin.managePartners}
              </Link>
              <Link
                href="/admin/leads"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-omniwallet-primary hover:bg-gray-50 rounded-md transition"
              >
                {t.admin.manageLeads}
              </Link>
              <Link
                href="/admin/content"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-omniwallet-primary hover:bg-gray-50 rounded-md transition"
              >
                {t.nav.content}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden md:block">
              {userName}
            </span>
            <LanguageSelector />
            <LogoutButton className="text-sm text-gray-600 hover:text-gray-900 transition" />
          </div>
        </div>
      </div>
    </header>
  )
}
