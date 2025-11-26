import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContentForm from '../../components/ContentForm'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'

export default async function EditContentPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getAdminSession()

  const content = await prisma.content.findUnique({
    where: { id: params.id },
  })

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Contenido no encontrado</h1>
          <Link
            href="/admin/content"
            className="text-omniwallet-primary hover:text-omniwallet-secondary"
          >
            ← Volver a Contenidos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
            <h1 className="text-2xl font-semibold text-gray-900">Edit Resource</h1>
            <p className="text-sm text-gray-500 mt-1">{content.title}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <ContentForm content={content} />
          </div>
        </div>
      </main>
    </div>
  )
}
