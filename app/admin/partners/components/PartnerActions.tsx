'use client'

import { useState } from 'react'
import { PartnerStatus, PartnerCategory } from '@/types'
import { updatePartnerCategory, suspendPartner, activatePartner, updatePartnerContract, updatePartnerOmniwalletAccount, updatePartnerYearlyEvent, updatePartnerCanHaveAffiliates, updatePartnerCommissionRate } from '../actions'
import { Shield, ShieldOff, Tag, FileText, Save, X, Wallet, Presentation, CheckCircle, Circle, Users, UserPlus, Percent } from 'lucide-react'

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

export function UpdateContractForm({
  partnerId,
  currentContractUrl,
}: {
  partnerId: string
  currentContractUrl: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [contractUrl, setContractUrl] = useState(currentContractUrl || '')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await updatePartnerContract(partnerId, contractUrl)

    if (result.success) {
      setMessage('Contract URL updated successfully')
      setEditing(false)
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(result.error || 'Failed to update contract')
    }

    setLoading(false)
  }

  if (!editing) {
    return (
      <div>
        {currentContractUrl ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">Contract Uploaded</p>
                <a
                  href={currentContractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-omniwallet-primary hover:text-omniwallet-secondary underline break-all"
                >
                  {currentContractUrl}
                </a>
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-omniwallet-primary hover:text-omniwallet-secondary font-medium"
            >
              Update Contract URL
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">No contract uploaded yet</p>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
            >
              <FileText className="w-4 h-4" />
              Add Contract URL
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="contractUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Contract URL
        </label>
        <input
          type="url"
          id="contractUrl"
          value={contractUrl}
          onChange={(e) => setContractUrl(e.target.value)}
          placeholder="https://example.com/contract.pdf"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Paste the URL of the contract document (e.g., Google Drive, Dropbox, etc.)
        </p>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false)
            setContractUrl(currentContractUrl || '')
            setMessage('')
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  )
}

export function UpdateOmniwalletAccountForm({
  partnerId,
  currentAccountUrl,
}: {
  partnerId: string
  currentAccountUrl: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [accountUrl, setAccountUrl] = useState(currentAccountUrl || '')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await updatePartnerOmniwalletAccount(partnerId, accountUrl)

    if (result.success) {
      setMessage('Omniwallet Account URL updated successfully')
      setEditing(false)
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(result.error || 'Failed to update Omniwallet account')
    }

    setLoading(false)
  }

  if (!editing) {
    return (
      <div>
        {currentAccountUrl ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Wallet className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">Omniwallet Account Configured</p>
                <a
                  href={currentAccountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-omniwallet-primary hover:text-omniwallet-secondary underline break-all"
                >
                  {currentAccountUrl}
                </a>
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-omniwallet-primary hover:text-omniwallet-secondary font-medium"
            >
              Update Account URL
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">No Omniwallet account configured yet</p>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
            >
              <Wallet className="w-4 h-4" />
              Add Account URL
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="accountUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Omniwallet Account URL
        </label>
        <input
          type="url"
          id="accountUrl"
          value={accountUrl}
          onChange={(e) => setAccountUrl(e.target.value)}
          placeholder="https://app.omniwallet.com/partner/account-id"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Paste the URL to the partner's Omniwallet account dashboard
        </p>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false)
            setAccountUrl(currentAccountUrl || '')
            setMessage('')
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  )
}

export function ToggleYearlyEventButton({
  partnerId,
  hasCompletedYearlyEvent,
}: {
  partnerId: string
  hasCompletedYearlyEvent: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(hasCompletedYearlyEvent)

  const handleToggle = async () => {
    setLoading(true)
    const newValue = !completed
    const result = await updatePartnerYearlyEvent(partnerId, newValue)
    if (result.success) {
      setCompleted(newValue)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${completed ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Presentation className={`w-5 h-5 ${completed ? 'text-green-600' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Evento/Webinar Conjunto
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Indica si el partner ha participado o creado un evento o webinar conjunto este año
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 ${
                completed
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {completed ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {loading ? 'Actualizando...' : 'Completado'}
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  {loading ? 'Actualizando...' : 'Pendiente'}
                </>
              )}
            </button>
            <span className="text-xs text-gray-500">
              Click para {completed ? 'marcar como pendiente' : 'marcar como completado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ToggleAffiliatesButton({
  partnerId,
  canHaveAffiliates,
  affiliatesCount,
}: {
  partnerId: string
  canHaveAffiliates: boolean
  affiliatesCount: number
}) {
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState(canHaveAffiliates)

  const handleToggle = async () => {
    setLoading(true)
    const newValue = !enabled
    const result = await updatePartnerCanHaveAffiliates(partnerId, newValue)
    if (result.success) {
      setEnabled(newValue)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${enabled ? 'bg-purple-100' : 'bg-gray-100'}`}>
          <Users className={`w-5 h-5 ${enabled ? 'text-purple-600' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Programa de Afiliados
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Permite que este partner pueda reclutar y gestionar sus propios afiliados
          </p>
          {affiliatesCount > 0 && (
            <p className="text-xs text-purple-600 mb-3">
              <UserPlus className="w-3 h-3 inline mr-1" />
              Actualmente tiene {affiliatesCount} afiliado{affiliatesCount !== 1 ? 's' : ''}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 ${
                enabled
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {enabled ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {loading ? 'Actualizando...' : 'Habilitado'}
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  {loading ? 'Actualizando...' : 'Deshabilitado'}
                </>
              )}
            </button>
            <span className="text-xs text-gray-500">
              Click para {enabled ? 'deshabilitar' : 'habilitar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function UpdateCommissionRateForm({
  partnerId,
  currentRate,
}: {
  partnerId: string
  currentRate: number
}) {
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [rate, setRate] = useState(currentRate)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await updatePartnerCommissionRate(partnerId, rate)

    if (result.success) {
      setMessage('Comisión actualizada correctamente')
      setEditing(false)
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(result.error || 'Error al actualizar la comisión')
    }

    setLoading(false)
  }

  if (!editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Percent className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">Comisión Base</p>
            <p className="text-2xl font-bold text-green-600">{currentRate}%</p>
            <p className="text-xs text-gray-500 mt-1">
              Esta es la comisión por defecto para los leads de este partner
            </p>
            <button
              onClick={() => setEditing(true)}
              className="mt-3 text-sm text-omniwallet-primary hover:text-omniwallet-secondary font-medium"
            >
              Modificar comisión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-green-100">
          <Percent className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700 mb-1">
            Comisión Base (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="commissionRate"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.5"
              className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              required
            />
            <span className="text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Valor entre 0 y 100
          </p>
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('correctamente') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <div className="flex gap-2 ml-11">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false)
            setRate(currentRate)
            setMessage('')
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
      </div>
    </form>
  )
}
