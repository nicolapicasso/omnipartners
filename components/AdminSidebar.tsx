'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, TrendingUp, FileText } from 'lucide-react'
import { useTranslation } from '@/lib/contexts/LanguageContext'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const navItems = [
    {
      href: '/admin',
      label: t.nav.dashboard,
      icon: LayoutDashboard,
      active: pathname === '/admin'
    },
    {
      href: '/admin/partners',
      label: t.admin.managePartners,
      icon: Users,
      active: pathname?.startsWith('/admin/partners')
    },
    {
      href: '/admin/leads',
      label: t.admin.manageLeads,
      icon: TrendingUp,
      active: pathname?.startsWith('/admin/leads')
    },
    {
      href: '/admin/content',
      label: t.nav.content,
      icon: FileText,
      active: pathname?.startsWith('/admin/content')
    }
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                item.active
                  ? 'bg-omniwallet-primary/10 text-omniwallet-primary'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-omniwallet-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
