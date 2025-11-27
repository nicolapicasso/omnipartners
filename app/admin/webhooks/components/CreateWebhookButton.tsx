'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import WebhookFormModal from './WebhookFormModal'

interface EventType {
  value: string
  label: string
  category: string
}

interface CreateWebhookButtonProps {
  eventTypes: EventType[]
  variant?: 'default' | 'primary'
}

export default function CreateWebhookButton({ eventTypes, variant = 'default' }: CreateWebhookButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          variant === 'primary'
            ? 'bg-omniwallet-primary text-white hover:bg-omniwallet-secondary'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Plus className="w-4 h-4" />
        Nueva Suscripcion
      </button>

      {isOpen && (
        <WebhookFormModal
          eventTypes={eventTypes}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
