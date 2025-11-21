import { getAdminSession } from '@/lib/session'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContentForm from '../components/ContentForm'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'

export default async function NewContentPage() {
  const session = await getAdminSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="ml-64 pt-20 px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/admin/content"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-omniwallet-primary mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Content
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Resource</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add educational content for partners
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <ContentForm />
          </div>
        </div>
      </main>
    </div>
  )
}
