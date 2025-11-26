import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { ContentType, ContentCategory, ContentStatus } from '@/types'
import Link from 'next/link'
import { FileText, Video, BookOpen, FileCheck, Award, Star, Search } from 'lucide-react'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'

export default async function PartnerResourcesPage({
  searchParams,
}: {
  searchParams: { category?: string; type?: string; search?: string }
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

  const favoriteIds = contentFavorites.map((f) => f.contentId)

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Resource Library</h1>
          <p className="text-sm text-gray-500 mt-1">{contents.length} resources available</p>
        </div>

        {/* Search, Categories and Favorites Row */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search Bar */}
          <form method="GET" className="flex-1">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="Buscar recursos..."
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-omniwallet-primary text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Favorites Button */}
          <Link
            href="/partner/resources/favorites"
            className="bg-omniwallet-primary text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Star className="w-4 h-4" />
            My Favorites
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/partner/resources"
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                !searchParams.category
                  ? 'bg-omniwallet-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.value}
                href={`/partner/resources?category=${cat.value}`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  searchParams.category === cat.value
                    ? 'bg-omniwallet-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Resources */}
        {featured.length > 0 && !searchParams.category && !searchParams.search && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((content) => (
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

        {/* Resources Grid */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {searchParams.category
              ? `Recursos de ${categories.find((c) => c.value === searchParams.category)?.label}`
              : 'Todos los Recursos'}
          </h3>
          {contents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No resources available</p>
              <Link
                href="/partner/resources"
                className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-medium"
              >
                View all resources
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
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
