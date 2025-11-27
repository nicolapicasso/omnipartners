'use client'

import { useState } from 'react'
import { X, Webhook, Check, RefreshCw, Copy, CheckCircle } from 'lucide-react'
import { updateWebhookSubscription, regenerateSecret } from '../actions'

interface Subscription {
  id: string
  name: string
  url: string
  events: string[]
  description: string | null
  secret: string | null
  isActive: boolean
}

interface EventType {
  value: string
  label: string
  category: string
}

interface EditWebhookModalProps {
  subscription: Subscription
  eventTypes: EventType[]
  onClose: () => void
}

export default function EditWebhookModal({ subscription, eventTypes, onClose }: EditWebhookModalProps) {
  const [name, setName] = useState(subscription.name)
  const [url, setUrl] = useState(subscription.url)
  const [description, setDescription] = useState(subscription.description || '')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(subscription.events)
  const [secret, setSecret] = useState(subscription.secret || '')
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Group events by category
  const eventsByCategory = eventTypes.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = []
    }
    acc[event.category].push(event)
    return acc
  }, {} as Record<string, EventType[]>)

  const toggleEvent = (eventValue: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventValue)
        ? prev.filter(e => e !== eventValue)
        : [...prev, eventValue]
    )
  }

  const selectAllInCategory = (category: string) => {
    const categoryEvents = eventsByCategory[category].map(e => e.value)
    const allSelected = categoryEvents.every(e => selectedEvents.includes(e))

    if (allSelected) {
      setSelectedEvents(prev => prev.filter(e => !categoryEvents.includes(e)))
    } else {
      setSelectedEvents(prev => [...new Set([...prev, ...categoryEvents])])
    }
  }

  const handleRegenerateSecret = async () => {
    if (!confirm('¿Estas seguro de regenerar el secret? El anterior dejara de funcionar.')) return

    setRegenerating(true)
    try {
      const newSecret = await regenerateSecret(subscription.id)
      setSecret(newSecret)
    } catch {
      setError('Error al regenerar el secret')
    } finally {
      setRegenerating(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (!url.trim()) {
      setError('La URL es requerida')
      return
    }

    try {
      new URL(url)
    } catch {
      setError('La URL no es valida')
      return
    }

    if (selectedEvents.length === 0) {
      setError('Debes seleccionar al menos un evento')
      return
    }

    setLoading(true)
    try {
      await updateWebhookSubscription(subscription.id, {
        name: name.trim(),
        url: url.trim(),
        description: description.trim() || undefined,
        events: selectedEvents
      })
      onClose()
    } catch {
      setError('Error al actualizar la suscripcion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-omniwallet-primary/10 rounded-lg hidden sm:block">
              <Webhook className="w-5 h-5 text-omniwallet-primary" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Editar Suscripcion</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-5">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Webhook *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripcion (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary text-sm"
                />
              </div>

              {/* Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret (para verificacion de firma)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={secret}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={copySecret}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      title="Copiar"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateSecret}
                    disabled={regenerating}
                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                    <span className="sm:inline">Regenerar</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Usa este secret para verificar la firma en el header X-Webhook-Signature
                </p>
              </div>
            </div>

            {/* Events Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Eventos a escuchar *
              </label>

              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {Object.entries(eventsByCategory).map(([category, events]) => {
                  const categoryEventValues = events.map(e => e.value)
                  const allCategorySelected = categoryEventValues.every(e => selectedEvents.includes(e))
                  const someCategorySelected = categoryEventValues.some(e => selectedEvents.includes(e))

                  return (
                    <div key={category} className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => selectAllInCategory(category)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition flex-shrink-0 ${
                            allCategorySelected
                              ? 'bg-omniwallet-primary border-omniwallet-primary'
                              : someCategorySelected
                                ? 'bg-omniwallet-primary/30 border-omniwallet-primary'
                                : 'border-gray-300'
                          }`}
                        >
                          {allCategorySelected && <Check className="w-3 h-3 text-white" />}
                          {someCategorySelected && !allCategorySelected && (
                            <div className="w-2 h-0.5 bg-white" />
                          )}
                        </button>
                        <span className="font-medium text-gray-700 text-sm">{category}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-6">
                        {events.map((event) => (
                          <label
                            key={event.value}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(event.value)}
                              onChange={() => toggleEvent(event.value)}
                              className="w-4 h-4 rounded border-gray-300 text-omniwallet-primary focus:ring-omniwallet-primary"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">
                              {event.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedEvents.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''} seleccionado{selectedEvents.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t bg-gray-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-omniwallet-primary text-white rounded-md hover:bg-omniwallet-secondary transition disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
