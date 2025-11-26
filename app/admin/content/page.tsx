import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { ContentType, ContentCategory, ContentStatus } from '@/types'
import Link from 'next/link'
import { Plus, Eye, Download, FileText, Video, BookOpen, FileCheck, Award } from 'lucide-react'
import { ToggleStatusButton, DeleteContentButton } from './components/ContentActions'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminContentPage() {
  const session = await getAdminSession()

  const contents = await prisma.content.findMany({
    orderBy: [{ status: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  })

  const stats = {
    total: contents.length,
    published: contents.filter((c) => c.status === ContentStatus.PUBLISHED).length,
    draft: contents.filter((c) => c.status === ContentStatus.DRAFT).length,
    featured: contents.filter((c) => c.isFeatured).length,
  }

  const getStatusColor = (status: string) => {
    return status === ContentStatus.PUBLISHED
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      COMMERCIAL: 'bg-purple-100 text-purple-800',
      TECHNICAL: 'bg-blue-100 text-blue-800',
      STRATEGIC: 'bg-indigo-100 text-indigo-800',
      LEGAL: 'bg-red-100 text-red-800',
      GENERAL: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case ContentType.VIDEO:
        return <Video className="w-4 h-4" />
      case ContentType.GUIDE:
        return <BookOpen className="w-4 h-4" />
      case ContentType.CONTRACT:
        return <FileCheck className="w-4 h-4" />
      case ContentType.CERTIFICATION:
        return <Award className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-24 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Title */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} resources · {stats.published} published
            </p>
          </div>
          <Link
            href="/admin/content/new"
            className="bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Resource
          </Link>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Total Resources</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Published</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.published}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Drafts</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.draft}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Featured</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {stats.featured}
            </p>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">All Resources</h2>
          </div>
          <div className="overflow-x-auto">
            {contents.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No resources created yet</p>
                <Link
                  href="/admin/content/new"
                  className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create first resource
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vistas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Descargas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/admin/content/${content.id}/edit`}
                            className="text-sm font-medium text-omniwallet-primary hover:text-omniwallet-secondary"
                          >
                            {content.title}
                          </Link>
                          {content.isFeatured && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              ⭐ Destacado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          {getTypeIcon(content.type)}
                          {content.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(
                            content.category
                          )}`}
                        >
                          {content.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            content.status
                          )}`}
                        >
                          {content.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {content.viewCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {content.downloadCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <ToggleStatusButton
                            contentId={content.id}
                            currentStatus={content.status}
                          />
                          <DeleteContentButton contentId={content.id} title={content.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
