'use client'

import { useState } from 'react'
import { LeadStatus, CommissionType } from '@/types'
import { updateLeadStatus, updateLeadCommission } from '../actions'
import { TrendingUp, DollarSign, Percent } from 'lucide-react'

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
