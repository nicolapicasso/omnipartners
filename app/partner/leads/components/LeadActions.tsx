'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePartnerLead, archivePartnerLead, unarchivePartnerLead } from '../actions'
import { Trash2, Archive, ArchiveRestore } from 'lucide-react'

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    const result = await deletePartnerLead(leadId)
    if (result.success) {
      router.push('/partner/leads')
    } else {
      setError(result.error || 'Error al eliminar el lead')
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
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setShowConfirm(false)
            setError(null)
          }}
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

export function ArchiveLeadButton({
  leadId,
  isArchived,
}: {
  leadId: string
  isArchived: boolean
}) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    if (isArchived) {
      await unarchivePartnerLead(leadId)
    } else {
      await archivePartnerLead(leadId)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 ${
        isArchived
          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
      }`}
    >
      {isArchived ? (
        <>
          <ArchiveRestore className="w-4 h-4" />
          {loading ? 'Restaurando...' : 'Restaurar Lead'}
        </>
      ) : (
        <>
          <Archive className="w-4 h-4" />
          {loading ? 'Archivando...' : 'Archivar Lead'}
        </>
      )}
    </button>
  )
}
