'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, DollarSign, FileText, Users, CheckCircle, Award, X, UserPlus } from 'lucide-react'
import { useTranslation } from '@/lib/contexts/LanguageContext'
import { useSidebar } from '@/lib/contexts/SidebarContext'
import Logo from './Logo'

interface PartnerSidebarProps {
  canHaveAffiliates?: boolean
}

export default function PartnerSidebar({ canHaveAffiliates = false }: PartnerSidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { isOpen, close } = useSidebar()

  const navItems = [
    {
      href: '/partner',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      active: pathname === '/partner'
    },
    {
      href: '/partner/leads',
      label: t('partner.myLeads'),
      icon: TrendingUp,
      active: pathname?.startsWith('/partner/leads')
    },
    {
      href: '/partner/commissions',
      label: t('nav.commissions'),
      icon: DollarSign,
      active: pathname?.startsWith('/partner/commissions')
    },
    {
      href: '/partner/resources',
      label: t('nav.resources'),
      icon: FileText,
      active: pathname?.startsWith('/partner/resources')
    },
    {
      href: '/partner/requirements',
      label: t('nav.requirements'),
      icon: CheckCircle,
      active: pathname?.startsWith('/partner/requirements')
    },
    {
      href: '/partner/certification',
      label: t('certification.title'),
      icon: Award,
      active: pathname?.startsWith('/partner/certification')
    },
    {
      href: '/partner/team',
      label: t('nav.team'),
      icon: Users,
      active: pathname?.startsWith('/partner/team')
    },
    // Conditionally add affiliates nav item
    ...(canHaveAffiliates ? [{
      href: '/partner/affiliates',
      label: t('nav.affiliates') || 'Mis Afiliados',
      icon: UserPlus,
      active: pathname?.startsWith('/partner/affiliates')
    }] : [])
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 lg:top-16 bottom-0 overflow-y-auto z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Mobile header with logo and close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <Logo variant="dark" size="sm" href="/partner" />
          <button
            onClick={close}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
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
    </>
  )
}
