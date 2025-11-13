'use client'

import { approvePartner, rejectPartner } from '../actions'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

export function ApproveButton({ partnerId }: { partnerId: string }) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await approvePartner(partnerId)
    setLoading(false)
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <Check className="w-4 h-4" />
      {loading ? 'Aprobando...' : 'Aprobar'}
    </button>
  )
}

export function RejectButton({ partnerId }: { partnerId: string }) {
  const [loading, setLoading] = useState(false)

  const handleReject = async () => {
    setLoading(true)
    await rejectPartner(partnerId)
    setLoading(false)
  }

  return (
    <button
      onClick={handleReject}
      disabled={loading}
      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <X className="w-4 h-4" />
      {loading ? 'Rechazando...' : 'Rechazar'}
    </button>
  )
}
