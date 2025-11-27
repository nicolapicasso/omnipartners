'use client'

import { useState } from 'react'
import { X, Webhook, Check } from 'lucide-react'
import { createWebhookSubscription } from '../actions'

interface EventType {
  value: string
  label: string
  category: string
}

interface WebhookFormModalProps {
  eventTypes: EventType[]
  onClose: () => void
}

export default function WebhookFormModal({ eventTypes, onClose }: WebhookFormModalProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const selectAll = () => {
    if (selectedEvents.length === eventTypes.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(eventTypes.map(e => e.value))
    }
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
      await createWebhookSubscription({
        name: name.trim(),
        url: url.trim(),
        description: description.trim() || undefined,
        events: selectedEvents
      })
      onClose()
    } catch (err) {
      setError('Error al crear la suscripcion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-omniwallet-primary/10 rounded-lg">
              <Webhook className="w-5 h-5 text-omniwallet-primary" />
            </div>
            <h2 className="text-lg font-semibold">Nueva Suscripcion de Webhook</h2>
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
          <div className="p-6 space-y-6">
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
                  placeholder="Ej: Make - Leads a Hubspot"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
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
                  placeholder="https://hook.make.com/..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripcion (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe para que se usa esta suscripcion..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                />
              </div>
            </div>

            {/* Events Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Eventos a escuchar *
                </label>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-omniwallet-primary hover:text-omniwallet-secondary"
                >
                  {selectedEvents.length === eventTypes.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>

              <div className="border rounded-lg divide-y">
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
                          className={`w-4 h-4 rounded border flex items-center justify-center transition ${
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
                        <span className="font-medium text-gray-700">{category}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 ml-6">
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
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-omniwallet-primary text-white rounded-lg hover:bg-omniwallet-secondary transition disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Suscripcion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
