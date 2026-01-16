import { getAdminSession } from '@/lib/session'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'
import { getOpenAIStatus, getTranslationStats } from './actions'
import TranslationsContent from './TranslationsContent'

export default async function TranslationsPage() {
  const session = await getAdminSession()

  const [openAIStatus, translationStats] = await Promise.all([
    getOpenAIStatus(),
    getTranslationStats(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Traducciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las traducciones del portal en múltiples idiomas
          </p>
        </div>

        <TranslationsContent
          isOpenAIConfigured={openAIStatus.isConfigured}
          initialStats={translationStats}
        />
      </main>
    </div>
  )
}
