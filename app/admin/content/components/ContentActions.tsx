'use client'

import { useState } from 'react'
import { toggleContentStatus, deleteContent } from '../actions'
import { ContentStatus } from '@/types'
import { Trash2, Eye, EyeOff } from 'lucide-react'

export function ToggleStatusButton({
  contentId,
  currentStatus,
}: {
  contentId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    await toggleContentStatus(contentId)
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
      title={
        currentStatus === ContentStatus.PUBLISHED ? 'Cambiar a borrador' : 'Publicar'
      }
    >
      {currentStatus === ContentStatus.PUBLISHED ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  )
}

export function DeleteContentButton({
  contentId,
  title,
}: {
  contentId: string
  title: string
}) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await deleteContent(contentId)
    if (!result.success) {
      alert(result.error || 'Error al eliminar')
    }
    setLoading(false)
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowConfirm(false)}
        disabled={loading}
        className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
      >
        Cancelar
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
      >
        {loading ? 'Eliminando...' : 'Confirmar'}
      </button>
    </div>
  )
}
