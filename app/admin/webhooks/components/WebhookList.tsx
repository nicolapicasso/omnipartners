'use client'

import { useState } from 'react'
import {
  Webhook,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Play,
  Edit,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react'
import { toggleWebhookSubscription, deleteWebhookSubscription, testWebhook } from '../actions'
import EditWebhookModal from './EditWebhookModal'

interface Subscription {
  id: string
  name: string
  url: string
  events: string[]
  description: string | null
  secret: string | null
  isActive: boolean
  lastTriggeredAt: Date | null
  successCount: number
  failureCount: number
  createdAt: Date
  logsCount: number
}

interface EventType {
  value: string
  label: string
  category: string
}

interface WebhookListProps {
  subscriptions: Subscription[]
  eventTypes: EventType[]
}

export default function WebhookList({ subscriptions, eventTypes }: WebhookListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string } | null>>({})
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  const getEventLabel = (eventValue: string) => {
    const event = eventTypes.find(e => e.value === eventValue)
    return event?.label || eventValue
  }

  const handleToggle = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }))
    try {
      await toggleWebhookSubscription(id)
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estas seguro de eliminar la suscripcion "${name}"?`)) return

    setLoading(prev => ({ ...prev, [id]: true }))
    try {
      await deleteWebhookSubscription(id)
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleTest = async (id: string) => {
    setLoading(prev => ({ ...prev, [`test-${id}`]: true }))
    setTestResults(prev => ({ ...prev, [id]: null }))

    try {
      const result = await testWebhook(id)
      setTestResults(prev => ({
        ...prev,
        [id]: {
          success: result.success,
          message: result.success
            ? `OK (${result.statusCode}) - ${result.responseTime}ms`
            : result.errorMessage || `Error (${result.statusCode})`
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [id]: {
          success: false,
          message: 'Error al ejecutar la prueba'
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [`test-${id}`]: false }))
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca'
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className={`bg-white rounded-lg border ${subscription.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}
          >
            {/* Header */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${subscription.isActive ? 'bg-omniwallet-primary/10' : 'bg-gray-100'}`}>
                    <Webhook className={`w-5 h-5 ${subscription.isActive ? 'text-omniwallet-primary' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
                      {!subscription.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <ExternalLink className="w-3 h-3" />
                      {subscription.url}
                    </p>
                    {subscription.description && (
                      <p className="text-sm text-gray-400 mt-1">{subscription.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Test Result */}
                  {testResults[subscription.id] && (
                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                      testResults[subscription.id]!.success
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {testResults[subscription.id]!.success
                        ? <CheckCircle className="w-3 h-3" />
                        : <XCircle className="w-3 h-3" />
                      }
                      {testResults[subscription.id]!.message}
                    </span>
                  )}

                  {/* Actions */}
                  <button
                    onClick={() => handleTest(subscription.id)}
                    disabled={loading[`test-${subscription.id}`] || !subscription.isActive}
                    className="p-2 text-gray-400 hover:text-omniwallet-primary hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                    title="Probar webhook"
                  >
                    <Play className={`w-4 h-4 ${loading[`test-${subscription.id}`] ? 'animate-pulse' : ''}`} />
                  </button>
                  <button
                    onClick={() => setEditingSubscription(subscription)}
                    className="p-2 text-gray-400 hover:text-omniwallet-primary hover:bg-gray-100 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(subscription.id)}
                    disabled={loading[subscription.id]}
                    className="p-2 text-gray-400 hover:text-omniwallet-primary hover:bg-gray-100 rounded-lg transition"
                    title={subscription.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {subscription.isActive ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id, subscription.name)}
                    disabled={loading[subscription.id]}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === subscription.id ? null : subscription.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    {expandedId === subscription.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Events Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {subscription.events.map((event) => (
                  <span
                    key={event}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {getEventLabel(event)}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {subscription.successCount} exitosos
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-400" />
                  {subscription.failureCount} fallidos
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Ultimo: {formatDate(subscription.lastTriggeredAt)}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === subscription.id && (
              <div className="border-t p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ID</p>
                    <p className="font-mono text-xs">{subscription.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Creado</p>
                    <p>{formatDate(subscription.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Secret</p>
                    <p className="font-mono text-xs">
                      {subscription.secret ? `${subscription.secret.substring(0, 16)}...` : 'No configurado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total de logs</p>
                    <p>{subscription.logsCount}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-2">Eventos suscritos:</p>
                  <div className="space-y-1">
                    {subscription.events.map((event) => (
                      <div key={event} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-omniwallet-primary rounded-full" />
                        <span className="font-mono text-xs text-gray-600">{event}</span>
                        <span className="text-gray-400">-</span>
                        <span>{getEventLabel(event)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSubscription && (
        <EditWebhookModal
          subscription={editingSubscription}
          eventTypes={eventTypes}
          onClose={() => setEditingSubscription(null)}
        />
      )}
    </>
  )
}
