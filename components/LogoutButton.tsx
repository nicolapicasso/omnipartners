'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/lib/contexts/LanguageContext'

export default function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleLogout = async () => {
    setLoading(true)
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className || 'flex items-center gap-2 text-white hover:text-omniwallet-light transition disabled:opacity-50'}
    >
      <LogOut className="w-4 h-4" />
      {loading ? `${t.common.loading}` : t.common.logout}
    </button>
  )
}
