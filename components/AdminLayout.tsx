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
      <main className="lg:ml-64 pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </div>
  )
}
