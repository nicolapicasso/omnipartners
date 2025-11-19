import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { ContentType, ContentCategory, ContentStatus } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Plus, Eye, Download, FileText, Video, BookOpen, FileCheck, Award } from 'lucide-react'
import { ToggleStatusButton, DeleteContentButton } from './components/ContentActions'

export default async function AdminContentPage() {
  await getAdminSession()

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
      <header className="bg-omniwallet-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-white hover:text-omniwallet-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Contenidos</h1>
              <p className="text-omniwallet-light mt-2">
                {stats.total} recursos · {stats.published} publicados
              </p>
            </div>
            <Link
              href="/admin/content/new"
              className="bg-white text-omniwallet-primary px-6 py-3 rounded-lg font-semibold hover:bg-omniwallet-light transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Recurso
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Recursos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Publicados</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.published}</p>
              </div>
              <FileCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Borradores</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.draft}</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Destacados</p>
                <p className="text-3xl font-bold text-omniwallet-primary mt-2">
                  {stats.featured}
                </p>
              </div>
              <Award className="w-8 h-8 text-omniwallet-primary" />
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Todos los Recursos</h2>
          </div>
          <div className="overflow-x-auto">
            {contents.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No hay recursos creados todavía</p>
                <Link
                  href="/admin/content/new"
                  className="text-omniwallet-primary hover:text-omniwallet-secondary font-semibold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear primer recurso
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
