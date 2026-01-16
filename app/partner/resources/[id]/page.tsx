import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { ContentType } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Download, Calendar, Eye, FileText, Video, BookOpen, FileCheck, Award, Tag } from 'lucide-react'
import { FavoriteButton, TrackViewButton } from '../components/ResourceActions'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'

export default async function ResourceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  })

  if (!partner) {
    return <div>Partner not found</div>
  }

  // Try to find user (for team members) or use empty favorites for partner owners
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      contentFavorites: true,
    },
  })

  // Partner owners logged via Partner model won't have a User record
  const contentFavorites = user?.contentFavorites || []

  const content = await prisma.content.findUnique({
    where: { id: params.id },
  })

  if (!content || content.status !== 'PUBLISHED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Recurso no encontrado</h1>
          <Link
            href="/partner/resources"
            className="text-omniwallet-primary hover:text-omniwallet-secondary"
          >
            ← Volver a Recursos
          </Link>
        </div>
      </div>
    )
  }

  const isFavorite = contentFavorites.some((f) => f.contentId === content.id)

  // Get related content
  const relatedContent = await prisma.content.findMany({
    where: {
      status: 'PUBLISHED',
      category: content.category,
      id: { not: content.id },
    },
    take: 3,
    orderBy: { viewCount: 'desc' },
  })

  const tags = content.tags ? JSON.parse(content.tags) : []

  const getTypeIcon = (type: string) => {
    switch (type) {
      case ContentType.VIDEO:
        return <Video className="w-6 h-6" />
      case ContentType.GUIDE:
        return <BookOpen className="w-6 h-6" />
      case ContentType.CONTRACT:
        return <FileCheck className="w-6 h-6" />
      case ContentType.CERTIFICATION:
        return <Award className="w-6 h-6" />
      default:
        return <FileText className="w-6 h-6" />
    }
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

  const resourceUrl = content.externalUrl || content.fileUrl

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackViewButton contentId={content.id} />
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar canHaveAffiliates={partner.canHaveAffiliates} />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/partner/resources"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-omniwallet-primary mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Recursos
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{content.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(content.category)}`}>
                  {content.category}
                </span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(content.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
            <FavoriteButton contentId={content.id} initialIsFavorite={isFavorite} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Viewer/Player */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-omniwallet-primary bg-opacity-10 rounded-lg flex items-center justify-center text-omniwallet-primary">
                  {getTypeIcon(content.type)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de Contenido</p>
                  <p className="font-semibold text-gray-900">{content.type}</p>
                </div>
              </div>

              {/* Video Embed */}
              {content.type === ContentType.VIDEO && content.externalUrl && (
                <div className="aspect-video bg-gray-100 rounded-lg mb-4">
                  {content.externalUrl.includes('youtube.com') || content.externalUrl.includes('youtu.be') ? (
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={content.externalUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      allowFullScreen
                    />
                  ) : content.externalUrl.includes('vimeo.com') ? (
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={content.externalUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      allowFullScreen
                    />
                  ) : (
                    <video controls className="w-full h-full rounded-lg">
                      <source src={content.externalUrl} />
                    </video>
                  )}
                </div>
              )}

              {/* Download Button */}
              {resourceUrl && (
                <a
                  href={resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-omniwallet-primary text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {content.type === ContentType.VIDEO ? 'Ver Video' : 'Descargar Recurso'}
                </a>
              )}
            </div>

            {/* Description */}
            {content.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Descripción</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{content.description}</p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Content */}
            {relatedContent.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Recursos Relacionados
                </h3>
                <div className="space-y-3">
                  {relatedContent.map((related) => (
                    <Link
                      key={related.id}
                      href={`/partner/resources/${related.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-omniwallet-primary bg-opacity-10 rounded flex items-center justify-center text-omniwallet-primary flex-shrink-0">
                          {getTypeIcon(related.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{related.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {related.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-5 h-5" />
                    <span className="text-sm">Vistas</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{content.viewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Download className="w-5 h-5" />
                    <span className="text-sm">Descargas</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {content.downloadCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Información</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Tipo</p>
                  <p className="font-medium text-gray-900">{content.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Categoría</p>
                  <p className="font-medium text-gray-900">{content.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Publicado</p>
                  <p className="font-medium text-gray-900">
                    {new Date(content.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
