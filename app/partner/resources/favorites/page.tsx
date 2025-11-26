import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { ContentType } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Star, FileText, Video, BookOpen, FileCheck, Award } from 'lucide-react'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'

export default async function FavoritesPage() {
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
      contentFavorites: {
        include: {
          content: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  // Partner owners logged via Partner model won't have a User record
  const contentFavorites = user?.contentFavorites || []
  const favorites = contentFavorites.filter((f) => f.content.status === 'PUBLISHED')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case ContentType.VIDEO:
        return <Video className="w-5 h-5" />
      case ContentType.GUIDE:
        return <BookOpen className="w-5 h-5" />
      case ContentType.CONTRACT:
        return <FileCheck className="w-5 h-5" />
      case ContentType.CERTIFICATION:
        return <Award className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      COMMERCIAL: 'bg-purple-100 text-purple-800 border-purple-200',
      TECHNICAL: 'bg-blue-100 text-blue-800 border-blue-200',
      STRATEGIC: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      LEGAL: 'bg-red-100 text-red-800 border-red-200',
      GENERAL: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar />

      <main className="lg:ml-64 pt-24 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/partner/resources"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-omniwallet-primary mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Favorites</h1>
              <p className="text-sm text-gray-500 mt-1">{favorites.length} saved resources</p>
            </div>
          </div>
        </div>
        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You don't have any favorite resources yet</p>
            <Link
              href="/partner/resources"
              className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-medium"
            >
              Explore resources →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(({ content }) => (
              <Link
                key={content.id}
                href={`/partner/resources/${content.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-omniwallet-primary bg-opacity-10 rounded-lg flex items-center justify-center text-omniwallet-primary">
                    {getTypeIcon(content.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{content.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(
                        content.category
                      )}`}
                    >
                      {content.category}
                    </span>
                  </div>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                {content.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {content.description}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  {content.viewCount} vistas · {content.downloadCount} descargas
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
