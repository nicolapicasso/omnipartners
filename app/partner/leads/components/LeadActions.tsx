'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePartnerLead } from '../actions'
import { Trash2 } from 'lucide-react'

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await deletePartnerLead(leadId)
    if (result.success) {
      router.push('/partner/leads')
    } else {
      alert(result.error || 'Error al eliminar el lead')
      setLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar Lead
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        ¿Estás seguro? Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Eliminando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  )
}
