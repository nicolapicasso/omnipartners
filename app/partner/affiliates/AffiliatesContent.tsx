'use client'

import { useState } from 'react'
import { Users, Mail, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, Edit2, Save, X, Key, AlertCircle } from 'lucide-react'
import { createAffiliate, updateAffiliateCommission } from './actions'
import { useTranslation } from '@/lib/contexts/LanguageContext'

interface Affiliate {
  id: string
  companyName: string
  contactName: string
  email: string
  status: string
  affiliateCommission: number | null
  leadsCount: number
  clientsCount: number
  createdAt: string
  temporaryPassword: string | null
}

export function AffiliatesList({
  affiliates,
  parentCommission,
}: {
  affiliates: Affiliate[]
  parentCommission: number
}) {
  const { t } = useTranslation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCommission, setEditCommission] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const handleEditStart = (affiliate: Affiliate) => {
    setEditingId(affiliate.id)
    setEditCommission(affiliate.affiliateCommission || 0)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditCommission(0)
  }

  const handleEditSave = async (affiliateId: string) => {
    if (editCommission > parentCommission) {
      alert(t('affiliates.commissionTooHigh').replace('{max}', String(parentCommission)))
      return
    }
    if (editCommission < 0) {
      alert(t('affiliates.commissionNegative'))
      return
    }

    setLoading(true)
    const result = await updateAffiliateCommission(affiliateId, editCommission)
    if (result.success) {
      setEditingId(null)
      window.location.reload()
    } else {
      alert(result.error || t('affiliates.errorUpdatingCommission'))
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            {t('affiliates.statusActive')}
          </span>
        )
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            {t('affiliates.statusPending')}
          </span>
        )
      case 'SUSPENDED':
        return (
          <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full">
            <XCircle className="w-3 h-3" />
            {t('affiliates.statusSuspended')}
          </span>
        )
      default:
        return (
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {status}
          </span>
        )
    }
  }

  if (affiliates.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-sm text-gray-500 mb-2">{t('affiliates.noAffiliates')}</p>
        <p className="text-xs text-gray-400">
          {t('affiliates.addFirstAffiliate')}
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {affiliates.map((affiliate) => (
        <div key={affiliate.id} className="p-4 hover:bg-gray-50 transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900">{affiliate.companyName}</p>
                {getStatusBadge(affiliate.status)}
              </div>
              <p className="text-xs text-gray-500">{affiliate.contactName}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" />
                {affiliate.email}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Commission */}
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">{t('affiliates.commission')}</p>
                {editingId === affiliate.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editCommission}
                      onChange={(e) => setEditCommission(parseFloat(e.target.value) || 0)}
                      min="0"
                      max={parentCommission}
                      step="0.5"
                      className="w-16 text-sm border border-gray-300 rounded px-2 py-1"
                    />
                    <span className="text-xs text-gray-500">%</span>
                    <button
                      onClick={() => handleEditSave(affiliate.id)}
                      disabled={loading}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      disabled={loading}
                      className="p-1 text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-purple-600">
                      {affiliate.affiliateCommission || 0}%
                    </span>
                    <button
                      onClick={() => handleEditStart(affiliate)}
                      className="p-1 text-gray-400 hover:text-omniwallet-primary"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">{t('affiliates.leads')}</p>
                  <p className="text-sm font-semibold text-gray-900">{affiliate.leadsCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">{t('affiliates.clients')}</p>
                  <p className="text-sm font-semibold text-green-600">{affiliate.clientsCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Commission breakdown */}
          {affiliate.affiliateCommission && affiliate.status === 'ACTIVE' && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500">{t('affiliates.breakdownPerLead')}</span>
                <span className="text-purple-600">
                  {t('affiliates.affiliateLabel')} {affiliate.affiliateCommission}%
                </span>
                <span className="text-omniwallet-primary">
                  {t('affiliates.youLabel')} {parentCommission - affiliate.affiliateCommission}%
                </span>
              </div>
            </div>
          )}

          {/* Credentials display for affiliates with temporary password */}
          {affiliate.temporaryPassword && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-800">{t('affiliates.accessCredentials')}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">{t('affiliates.email')}</p>
                    <p className="text-xs font-mono text-gray-900 bg-white px-2 py-1 rounded border border-amber-100">
                      {affiliate.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('affiliates.password')}</p>
                    <p className="text-xs font-mono text-gray-900 bg-white px-2 py-1 rounded border border-amber-100">
                      {affiliate.temporaryPassword}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 mt-2">
                  <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    {t('affiliates.credentialsNote')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function CreateAffiliateForm({
  parentPartnerId,
  parentCommission,
}: {
  parentPartnerId: string
  parentCommission: number
}) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    country: 'España',
    commission: Math.floor(parentCommission / 2), // Default to half of parent commission
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (formData.commission > parentCommission) {
      setMessage({
        type: 'error',
        text: t('affiliates.commissionTooHigh').replace('{max}', String(parentCommission)),
      })
      setLoading(false)
      return
    }

    if (formData.commission < 0) {
      setMessage({
        type: 'error',
        text: t('affiliates.commissionNegative'),
      })
      setLoading(false)
      return
    }

    const result = await createAffiliate({
      ...formData,
      parentPartnerId,
    })

    if (result.success) {
      setMessage({
        type: 'success',
        text: t('affiliates.form.successMessage'),
      })
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        country: 'España',
        commission: Math.floor(parentCommission / 2),
      })
      // Reload page to show new affiliate
      setTimeout(() => window.location.reload(), 2000)
    } else {
      setMessage({
        type: 'error',
        text: result.error || t('affiliates.form.errorCreating'),
      })
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('affiliates.form.companyName')} *
        </label>
        <input
          type="text"
          id="companyName"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('affiliates.form.contactName')} *
        </label>
        <input
          type="text"
          id="contactName"
          value={formData.contactName}
          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {t('affiliates.form.email')} *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          {t('affiliates.form.phone')}
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          {t('affiliates.form.country')} *
        </label>
        <input
          type="text"
          id="country"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="commission" className="block text-sm font-medium text-gray-700 mb-1">
          {t('affiliates.form.affiliateCommission')} *
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            id="commission"
            value={formData.commission}
            onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
            min="0"
            max={parentCommission}
            step="0.5"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t('affiliates.form.maxCommission').replace('{max}', String(parentCommission))}
        </p>
        {formData.commission > 0 && (
          <p className="text-xs text-purple-600 mt-1">
            {t('affiliates.form.remainingCommission').replace('{remaining}', String(parentCommission - formData.commission))}
          </p>
        )}
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
      >
        {loading ? t('affiliates.form.creating') : t('affiliates.form.createAffiliate')}
      </button>

      <p className="text-xs text-gray-500 text-center">
        {t('affiliates.form.pendingApprovalNote')}
      </p>
    </form>
  )
}
