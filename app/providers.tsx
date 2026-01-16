'use client'

import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/lib/contexts/LanguageContext'
import { SidebarProvider } from '@/lib/contexts/SidebarContext'
import LanguageModal from '@/components/LanguageModal'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <SidebarProvider>
          {children}
          <LanguageModal />
        </SidebarProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
