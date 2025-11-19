import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { ContentType } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Star, FileText, Video, BookOpen, FileCheck, Award } from 'lucide-react'

export default async function FavoritesPage() {
  const session = await getPartnerSession()

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
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

  if (!user) {
    return <div>Error loading user</div>
  }

  const favorites = user.contentFavorites.filter((f) => f.content.status === 'PUBLISHED')

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
      <header className="bg-omniwallet-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/partner/resources"
            className="inline-flex items-center gap-2 text-white hover:text-omniwallet-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Recursos
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Star className="w-8 h-8 fill-white" />
                Mis Favoritos
              </h1>
              <p className="text-omniwallet-light mt-2">{favorites.length} recursos guardados</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tienes recursos favoritos todavía</p>
            <Link
              href="/partner/resources"
              className="text-omniwallet-primary hover:text-omniwallet-secondary font-semibold"
            >
              Explorar recursos →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(({ content }) => (
              <Link
                key={content.id}
                href={`/partner/resources/${content.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-yellow-100"
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
