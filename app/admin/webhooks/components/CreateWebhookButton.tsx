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
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
          variant === 'primary'
            ? 'bg-omniwallet-primary text-white hover:bg-omniwallet-secondary'
            : 'bg-omniwallet-primary text-white hover:bg-omniwallet-secondary'
        }`}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nueva Suscripcion</span>
        <span className="sm:hidden">Nueva</span>
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
