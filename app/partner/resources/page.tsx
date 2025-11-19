import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { ContentType, ContentCategory, ContentStatus } from '@/types'
import Link from 'next/link'
import { ArrowLeft, FileText, Video, BookOpen, FileCheck, Award, Star, Search } from 'lucide-react'

export default async function PartnerResourcesPage({
  searchParams,
}: {
  searchParams: { category?: string; type?: string; search?: string }
}) {
  const session = await getPartnerSession()

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      contentFavorites: true,
    },
  })

  if (!user) {
    return <div>Error loading user</div>
  }

  // Build query
  const where: any = {
    status: ContentStatus.PUBLISHED,
  }

  if (searchParams.category) {
    where.category = searchParams.category
  }

  if (searchParams.type) {
    where.type = searchParams.type
  }

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  const contents = await prisma.content.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  })

  const featured = contents.filter((c) => c.isFeatured).slice(0, 3)

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

  const categories = [
    { value: ContentCategory.COMMERCIAL, label: 'Comercial', color: 'purple' },
    { value: ContentCategory.TECHNICAL, label: 'Técnico', color: 'blue' },
    { value: ContentCategory.STRATEGIC, label: 'Estratégico', color: 'indigo' },
    { value: ContentCategory.LEGAL, label: 'Legal', color: 'red' },
    { value: ContentCategory.GENERAL, label: 'General', color: 'gray' },
  ]

  const favoriteIds = user.contentFavorites.map((f) => f.contentId)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-omniwallet-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 text-white hover:text-omniwallet-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Biblioteca de Recursos</h1>
              <p className="text-omniwallet-light mt-2">{contents.length} recursos disponibles</p>
            </div>
            <Link
              href="/partner/resources/favorites"
              className="bg-white text-omniwallet-primary px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-light transition inline-flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Mis Favoritos
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form method="GET" className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="Buscar recursos..."
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-omniwallet-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-omniwallet-secondary transition"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>

        {/* Featured Resources */}
        {featured.length > 0 && !searchParams.category && !searchParams.search && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Recursos Destacados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((content) => (
                <Link
                  key={content.id}
                  href={`/partner/resources/${content.id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-yellow-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-omniwallet-primary bg-opacity-10 rounded-lg flex items-center justify-center text-omniwallet-primary">
                      {getTypeIcon(content.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{content.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                          content.category
                        )}`}
                      >
                        {content.category}
                      </span>
                    </div>
                    {favoriteIds.includes(content.id) && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  {content.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{content.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Categorías</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/partner/resources"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                !searchParams.category
                  ? 'bg-omniwallet-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todas
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.value}
                href={`/partner/resources?category=${cat.value}`}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  searchParams.category === cat.value
                    ? 'bg-omniwallet-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {searchParams.category
              ? `Recursos de ${categories.find((c) => c.value === searchParams.category)?.label}`
              : 'Todos los Recursos'}
          </h3>
          {contents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No hay recursos disponibles</p>
              <Link
                href="/partner/resources"
                className="text-omniwallet-primary hover:text-omniwallet-secondary font-semibold"
              >
                Ver todos los recursos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <Link
                  key={content.id}
                  href={`/partner/resources/${content.id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
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
                    {favoriteIds.includes(content.id) && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
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
        </div>
      </main>
    </div>
  )
}
