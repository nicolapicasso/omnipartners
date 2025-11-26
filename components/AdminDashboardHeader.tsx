'use client'

import { Menu } from 'lucide-react'
import Logo from './Logo'
import LogoutButton from './LogoutButton'
import LanguageSelector from './LanguageSelector'
import NotificationBell from './NotificationBell'
import { useSidebar } from '@/lib/contexts/SidebarContext'

interface AdminDashboardHeaderProps {
  userName: string
}

export default function AdminDashboardHeader({ userName }: AdminDashboardHeaderProps) {
  const { toggle } = useSidebar()

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={toggle}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Logo variant="dark" size="sm" href="/admin" />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm text-gray-600 hidden md:block">
              {userName}
            </span>
            <NotificationBell />
            <LanguageSelector />
            <LogoutButton className="flex items-center gap-2 px-2 sm:px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition" />
          </div>
        </div>
      </div>
    </header>
  )
}
