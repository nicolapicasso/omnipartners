import { getWebhookSubscriptions, getAllWebhookEventTypes } from './actions'
import WebhookList from './components/WebhookList'
import CreateWebhookButton from './components/CreateWebhookButton'
import { Webhook, Plus } from 'lucide-react'

export default async function WebhooksPage() {
  const subscriptions = await getWebhookSubscriptions()
  const eventTypes = await getAllWebhookEventTypes()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Webhook className="w-7 h-7 text-omniwallet-primary" />
            Configuracion de Webhooks
          </h1>
          <p className="text-gray-600 mt-1">
            Suscribe URLs a eventos para integrar con Make, Hubspot u otros servicios
          </p>
        </div>
        <CreateWebhookButton eventTypes={eventTypes} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Suscripciones</p>
          <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Activas</p>
          <p className="text-2xl font-bold text-green-600">
            {subscriptions.filter(s => s.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Inactivas</p>
          <p className="text-2xl font-bold text-gray-400">
            {subscriptions.filter(s => !s.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Eventos Totales Enviados</p>
          <p className="text-2xl font-bold text-omniwallet-primary">
            {subscriptions.reduce((acc, s) => acc + s.successCount + s.failureCount, 0)}
          </p>
        </div>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
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
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Como funciona</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Cada suscripcion puede escuchar uno o varios tipos de eventos</li>
          <li>• Cuando ocurre un evento, se envia un POST a todas las URLs suscritas a ese evento</li>
          <li>• El payload incluye el tipo de evento, timestamp y datos relevantes</li>
          <li>• Puedes usar el secret para verificar la autenticidad del webhook (header X-Webhook-Signature)</li>
          <li>• Usa el boton &quot;Probar&quot; para verificar que tu URL responde correctamente</li>
        </ul>
      </div>
    </div>
  )
}
