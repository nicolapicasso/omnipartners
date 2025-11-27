'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle2
} from 'lucide-react'

interface Log {
  id: string
  subscriptionId: string
  event: string
  payload: string
  statusCode: number | null
  responseBody: string | null
  responseTime: number | null
  success: boolean
  errorMessage: string | null
  createdAt: Date
  subscription: {
    name: string
    url: string
  }
}

interface Subscription {
  id: string
  name: string
}

interface EventType {
  value: string
  label: string
  category: string
}

interface Filters {
  subscriptionId?: string
  event?: string
  success?: boolean
  page?: number
  limit?: number
}

interface Pagination {
  page: number
  totalPages: number
  total: number
}

interface WebhookLogsClientProps {
  logs: Log[]
  subscriptions: Subscription[]
  eventTypes: EventType[]
  currentFilters: Filters
  pagination: Pagination
}

export default function WebhookLogsClient({
  logs,
  subscriptions,
  eventTypes,
  currentFilters,
  pagination
}: WebhookLogsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Local filter state
  const [subscriptionId, setSubscriptionId] = useState(currentFilters.subscriptionId || '')
  const [event, setEvent] = useState(currentFilters.event || '')
  const [success, setSuccess] = useState<string>(
    currentFilters.success === true ? 'true' : currentFilters.success === false ? 'false' : ''
  )

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (subscriptionId) params.set('subscriptionId', subscriptionId)
    if (event) params.set('event', event)
    if (success) params.set('success', success)
    params.set('page', '1')
    router.push(`/admin/webhooks/logs?${params.toString()}`)
  }

  const clearFilters = () => {
    setSubscriptionId('')
    setEvent('')
    setSuccess('')
    router.push('/admin/webhooks/logs')
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/webhooks/logs?${params.toString()}`)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getEventLabel = (eventValue: string) => {
    const eventType = eventTypes.find(e => e.value === eventValue)
    return eventType?.label || eventValue
  }

  const copyPayload = (id: string, payload: string) => {
    navigator.clipboard.writeText(payload)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const hasActiveFilters = subscriptionId || event || success

  return (
    <div className="space-y-4">
      {/* Filters Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Filtros</span>
            {hasActiveFilters && (
              <span className="text-xs bg-omniwallet-primary text-white px-2 py-0.5 rounded-full">
                Activos
              </span>
            )}
          </div>
          {showFilters ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showFilters && (
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Subscription Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suscripcion
                </label>
                <select
                  value={subscriptionId}
                  onChange={(e) => setSubscriptionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                >
                  <option value="">Todas</option>
                  {subscriptions.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              {/* Event Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evento
                </label>
                <select
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                >
                  <option value="">Todos</option>
                  {eventTypes.map(et => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={success}
                  onChange={(e) => setSuccess(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                >
                  <option value="">Todos</option>
                  <option value="true">Exitosos</option>
                  <option value="false">Fallidos</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-omniwallet-primary text-white rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
              >
                Aplicar Filtros
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium transition"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay logs disponibles
          </h3>
          <p className="text-gray-500">
            Los logs apareceran cuando se envien eventos a tus suscripciones
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`bg-white rounded-lg shadow-sm border ${
                log.success ? 'border-gray-200' : 'border-red-200'
              }`}
            >
              {/* Log Header */}
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Status Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      log.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {log.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Event Type */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {getEventLabel(log.event)}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                          {log.event}
                        </span>
                      </div>

                      {/* Subscription Name */}
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{log.subscription.name}</span>
                      </p>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm flex-shrink-0">
                    {log.statusCode && (
                      <span className={`font-mono ${
                        log.statusCode >= 200 && log.statusCode < 300
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        HTTP {log.statusCode}
                      </span>
                    )}
                    {log.responseTime !== null && (
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.responseTime}ms
                      </span>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                    >
                      {expandedId === log.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {log.errorMessage && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                    {log.errorMessage}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedId === log.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                  {/* Payload */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Payload Enviado
                      </p>
                      <button
                        onClick={() => copyPayload(log.id, log.payload)}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        {copiedId === log.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-48">
                      {JSON.stringify(JSON.parse(log.payload), null, 2)}
                    </pre>
                  </div>

                  {/* Response */}
                  {log.responseBody && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Respuesta
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-32">
                        {log.responseBody}
                      </pre>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">URL</p>
                      <p className="font-mono text-xs mt-1 break-all">{log.subscription.url}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">ID del Log</p>
                      <p className="font-mono text-xs mt-1 break-all">{log.id}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">
            Mostrando {logs.length} de {pagination.total} logs
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-700 px-2">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
