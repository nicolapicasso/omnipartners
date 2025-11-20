'use client'

import { ReactNode } from 'react'
import AdminDashboardHeader from './AdminDashboardHeader'
import AdminSidebar from './AdminSidebar'

interface AdminLayoutProps {
  children: ReactNode
  userName: string
}

export default function AdminLayout({ children, userName }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={userName} />
      <AdminSidebar />
      <main className="ml-64 pt-16 px-8 py-8">
        {children}
      </main>
    </div>
  )
}
