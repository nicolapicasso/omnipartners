'use client'

import { useState } from 'react'
import { PartnerStatus, PartnerCategory } from '@/types'
import { updatePartnerCategory, suspendPartner, activatePartner } from '../actions'
import { Shield, ShieldOff, Tag } from 'lucide-react'

export function UpdateCategoryButton({
  partnerId,
  currentCategory
}: {
  partnerId: string
  currentCategory: string
}) {
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState(currentCategory)

  const handleUpdate = async (newCategory: PartnerCategory) => {
    setLoading(true)
    const result = await updatePartnerCategory(partnerId, newCategory)
    if (result.success) {
      setCategory(newCategory)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Tag className="w-4 h-4 text-gray-500" />
      <select
        value={category}
        onChange={(e) => handleUpdate(e.target.value as PartnerCategory)}
        disabled={loading}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent disabled:opacity-50"
      >
        <option value={PartnerCategory.AGENCY_PARTNER}>Agency Partner</option>
        <option value={PartnerCategory.TECH_PARTNER}>Tech Partner</option>
        <option value={PartnerCategory.REFERRAL}>Referral</option>
        <option value={PartnerCategory.CUSTOM}>Custom</option>
      </select>
    </div>
  )
}

export function ToggleStatusButton({
  partnerId,
  currentStatus,
}: {
  partnerId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    if (currentStatus === PartnerStatus.ACTIVE) {
      await suspendPartner(partnerId)
    } else if (currentStatus === PartnerStatus.SUSPENDED) {
      await activatePartner(partnerId)
    }
    setLoading(false)
  }

  if (currentStatus === PartnerStatus.PENDING || currentStatus === PartnerStatus.REJECTED) {
    return null
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 ${
        currentStatus === PartnerStatus.ACTIVE
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {currentStatus === PartnerStatus.ACTIVE ? (
        <>
          <ShieldOff className="w-4 h-4" />
          {loading ? 'Suspendiendo...' : 'Suspender Partner'}
        </>
      ) : (
        <>
          <Shield className="w-4 h-4" />
          {loading ? 'Activando...' : 'Activar Partner'}
        </>
      )}
    </button>
  )
}
