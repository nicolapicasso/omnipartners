'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LeadStatus, CommissionType } from '@/types'
import { updateLeadStatus, updateLeadCommission, archiveLead, unarchiveLead, deleteLead } from '../actions'
import { TrendingUp, DollarSign, Percent, Archive, ArchiveRestore, Trash2 } from 'lucide-react'

export function UpdateStatusButton({
  leadId,
  currentStatus,
}: {
  leadId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  const handleUpdate = async (newStatus: LeadStatus) => {
    setLoading(true)
    const result = await updateLeadStatus(leadId, newStatus)
    if (result.success) {
      setStatus(newStatus)
    }
    setLoading(false)
  }

  // Don't show status selector for archived leads
  if (status === LeadStatus.ARCHIVED) {
    return (
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-500" />
        <span className="px-2 py-1 text-sm bg-amber-100 text-amber-800 rounded-full">
          Archivado
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <TrendingUp className="w-4 h-4 text-gray-500" />
      <select
        value={status}
        onChange={(e) => handleUpdate(e.target.value as LeadStatus)}
        disabled={loading}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent disabled:opacity-50"
      >
        <option value={LeadStatus.LEAD}>Lead</option>
        <option value={LeadStatus.PROSPECT}>Prospect</option>
        <option value={LeadStatus.CLIENT}>Client</option>
      </select>
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
      await unarchiveLead(leadId)
    } else {
      await archiveLead(leadId)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 ${
        isArchived
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
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

export function DeleteLeadButton({
  leadId,
  leadName,
}: {
  leadId: string
  leadName: string
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    const result = await deleteLead(leadId)
    if (result.success && result.redirect) {
      router.push(result.redirect)
    } else if (!result.success) {
      setError(result.error || 'Error al eliminar')
      setLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar Lead
      </button>
    )
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
      <p className="text-sm text-red-800">
        ¿Estás seguro de que deseas eliminar permanentemente a <strong>{leadName}</strong>?
        Esta acción no se puede deshacer.
      </p>
      {error && (
        <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Eliminando...' : 'Sí, eliminar'}
        </button>
        <button
          onClick={() => {
            setShowConfirm(false)
            setError(null)
          }}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export function UpdateCommissionForm({
  leadId,
  currentType,
  currentRate,
}: {
  leadId: string
  currentType: string
  currentRate: number
}) {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState(currentType)
  const [rate, setRate] = useState(currentRate.toString())

  const handleUpdate = async () => {
    setLoading(true)
    const result = await updateLeadCommission(
      leadId,
      type as CommissionType,
      parseFloat(rate)
    )
    if (result.success) {
      // Success handled by revalidation
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Comisión
        </label>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          >
            <option value={CommissionType.AGENCY_PARTNER}>Agency Partner</option>
            <option value={CommissionType.TECH_PARTNER}>Tech Partner</option>
            <option value={CommissionType.REFERRAL}>Referral</option>
            <option value={CommissionType.CUSTOM}>Custom</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tasa de Comisión (%)
        </label>
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-gray-500" />
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full bg-omniwallet-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-secondary transition disabled:opacity-50"
      >
        {loading ? 'Actualizando...' : 'Actualizar Comisión'}
      </button>
    </div>
  )
}
