import { getWebhookSubscriptions, getAllWebhookEventTypes } from './actions'
import { getAdminSession } from '@/lib/session'
import WebhookList from './components/WebhookList'
import CreateWebhookButton from './components/CreateWebhookButton'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'
import { Webhook, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function WebhooksPage() {
  const session = await getAdminSession()
  const subscriptions = await getWebhookSubscriptions()
  const eventTypes = await getAllWebhookEventTypes()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Configuracion de Webhooks</h1>
            <p className="text-sm text-gray-500 mt-1">
              Suscribe URLs a eventos para integrar con Make, Hubspot u otros servicios
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/webhooks/logs"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Logs</span>
              <span className="sm:hidden">Logs</span>
            </Link>
            <CreateWebhookButton eventTypes={eventTypes} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Suscripciones</p>
            <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Activas</p>
            <p className="text-2xl font-bold text-green-600">
              {subscriptions.filter(s => s.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Inactivas</p>
            <p className="text-2xl font-bold text-gray-400">
              {subscriptions.filter(s => !s.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Eventos Enviados</p>
            <p className="text-2xl font-bold text-omniwallet-primary">
              {subscriptions.reduce((acc, s) => acc + s.successCount + s.failureCount, 0)}
            </p>
          </div>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Webhook className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay suscripciones configuradas
            </h3>
            <p className="text-gray-500 mb-6">
              Crea tu primera suscripcion para empezar a recibir eventos en tus servicios externos
            </p>
            <CreateWebhookButton eventTypes={eventTypes} variant="primary" />
          </div>
        ) : (
          <WebhookList subscriptions={subscriptions} eventTypes={eventTypes} />
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Como funciona</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cada suscripcion puede escuchar uno o varios tipos de eventos</li>
            <li>• Cuando ocurre un evento, se envia un POST a todas las URLs suscritas</li>
            <li>• El payload incluye el tipo de evento, timestamp y datos relevantes</li>
            <li>• Puedes usar el secret para verificar la autenticidad (header X-Webhook-Signature)</li>
            <li>• Usa el boton &quot;Probar&quot; para verificar que tu URL responde correctamente</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
