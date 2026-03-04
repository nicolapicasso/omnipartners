'use client'

import { useState } from 'react'
import { FileText, CheckCircle2, AlertCircle, Loader2, FileSignature } from 'lucide-react'
import { useTranslation } from '@/lib/contexts/LanguageContext'
import { signContract } from '@/app/admin/contracts/actions'

interface Contract {
  id: string
  status: string
  content: string
  signatoryName: string | null
  signatoryDni: string | null
  signatoryPosition: string | null
  companyCif: string | null
  companyAddress: string | null
  signedAt: Date | null
  validFrom: Date | null
  validUntil: Date | null
  template: {
    name: string
  } | null
}

interface ContractSignatureProps {
  contract: Contract | null
  partner: {
    companyName: string
    contactName: string
    email: string
    address: string | null
  }
}

export default function ContractSignature({ contract, partner }: ContractSignatureProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [form, setForm] = useState({
    signatoryName: partner.contactName || '',
    signatoryDni: '',
    signatoryPosition: '',
    companyCif: '',
    companyAddress: partner.address || '',
    termsAccepted: false,
    privacyAccepted: false,
    dataProcessingAccepted: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return

    // Validate all fields
    if (!form.signatoryName || !form.signatoryDni || !form.signatoryPosition || !form.companyCif || !form.companyAddress) {
      setError('Por favor, completa todos los campos obligatorios')
      return
    }

    if (!form.termsAccepted || !form.privacyAccepted || !form.dataProcessingAccepted) {
      setError('Debes aceptar todos los terminos y condiciones')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await signContract(contract.id, {
        signatoryName: form.signatoryName,
        signatoryDni: form.signatoryDni,
        signatoryPosition: form.signatoryPosition,
        companyCif: form.companyCif,
        companyAddress: form.companyAddress,
        termsAccepted: form.termsAccepted,
        privacyAccepted: form.privacyAccepted,
        dataProcessingAccepted: form.dataProcessingAccepted,
        ip: '', // Will be filled server-side if needed
        userAgent: navigator.userAgent,
      })

      if (result.success) {
        setSuccess(true)
        // Reload page to show signed contract
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(result.error || 'Error al firmar el contrato')
      }
    } catch {
      setError('Error inesperado al firmar el contrato')
    } finally {
      setLoading(false)
    }
  }

  // No contract assigned
  if (!contract) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('contract.noContract') || 'Sin contrato asignado'}
          </h2>
          <p className="text-gray-500">
            {t('contract.noContractDescription') || 'Aun no tienes un contrato asignado. El administrador te asignara uno pronto.'}
          </p>
        </div>
      </div>
    )
  }

  // Contract already signed
  if (contract.status === 'SIGNED') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-800">
                {t('contract.signed') || 'Contrato Firmado'}
              </h2>
              <p className="text-sm text-green-700 mt-1">
                {t('contract.signedDescription') || 'Tu contrato ha sido firmado correctamente.'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Firmante:</span>
                  <span className="ml-2 text-green-800 font-medium">{contract.signatoryName}</span>
                </div>
                <div>
                  <span className="text-green-600">DNI/NIE:</span>
                  <span className="ml-2 text-green-800 font-medium">{contract.signatoryDni}</span>
                </div>
                <div>
                  <span className="text-green-600">Fecha de firma:</span>
                  <span className="ml-2 text-green-800 font-medium">
                    {contract.signedAt && new Date(contract.signedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Valido hasta:</span>
                  <span className="ml-2 text-green-800 font-medium">
                    {contract.validUntil && new Date(contract.validUntil).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h3 className="font-semibold text-gray-900">{t('contract.content') || 'Contenido del Contrato'}</h3>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {contract.content}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  // Pending signature
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('contract.signContract') || 'Firma tu Contrato'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('contract.signDescription') || 'Revisa el contrato y completa los datos para firmarlo'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {t('contract.pendingSignature') || 'Pendiente de firma'}
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">
            {t('contract.signedSuccess') || 'Contrato firmado correctamente. Redirigiendo...'}
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h3 className="font-semibold text-gray-900">{t('contract.content') || 'Contenido del Contrato'}</h3>
            {contract.template && (
              <p className="text-xs text-gray-500 mt-1">{contract.template.name}</p>
            )}
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {contract.content}
            </pre>
          </div>
        </div>

        {/* Signature form */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              {t('contract.signatureData') || 'Datos de Firma'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contract.signatoryName') || 'Nombre completo del firmante'} *
              </label>
              <input
                type="text"
                value={form.signatoryName}
                onChange={(e) => setForm({ ...form, signatoryName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                placeholder="Juan Garcia Lopez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contract.signatoryDni') || 'DNI/NIE del firmante'} *
              </label>
              <input
                type="text"
                value={form.signatoryDni}
                onChange={(e) => setForm({ ...form, signatoryDni: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                placeholder="12345678A"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contract.signatoryPosition') || 'Cargo en la empresa'} *
              </label>
              <input
                type="text"
                value={form.signatoryPosition}
                onChange={(e) => setForm({ ...form, signatoryPosition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                placeholder="Director General, Administrador, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contract.companyCif') || 'CIF de la empresa'} *
              </label>
              <input
                type="text"
                value={form.companyCif}
                onChange={(e) => setForm({ ...form, companyCif: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                placeholder="B12345678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contract.companyAddress') || 'Direccion fiscal'} *
              </label>
              <textarea
                value={form.companyAddress}
                onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                placeholder="Calle Principal 123, 28001 Madrid, Espana"
                required
              />
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                  className="mt-1 rounded border-gray-300 text-omniwallet-primary focus:ring-omniwallet-primary"
                  required
                />
                <span className="text-sm text-gray-700">
                  {t('contract.acceptTerms') || 'Acepto los terminos y condiciones del contrato de colaboracion'}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.privacyAccepted}
                  onChange={(e) => setForm({ ...form, privacyAccepted: e.target.checked })}
                  className="mt-1 rounded border-gray-300 text-omniwallet-primary focus:ring-omniwallet-primary"
                  required
                />
                <span className="text-sm text-gray-700">
                  {t('contract.acceptPrivacy') || 'Acepto la politica de privacidad'}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.dataProcessingAccepted}
                  onChange={(e) => setForm({ ...form, dataProcessingAccepted: e.target.checked })}
                  className="mt-1 rounded border-gray-300 text-omniwallet-primary focus:ring-omniwallet-primary"
                  required
                />
                <span className="text-sm text-gray-700">
                  {t('contract.acceptDataProcessing') || 'Autorizo el tratamiento de mis datos personales'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-4 py-3 bg-omniwallet-primary text-white rounded-lg hover:bg-omniwallet-secondary transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('contract.signing') || 'Firmando...'}
                </>
              ) : (
                <>
                  <FileSignature className="w-5 h-5" />
                  {t('contract.signButton') || 'Firmar Contrato'}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              {t('contract.legalNote') || 'Al firmar, confirmas que tienes la autoridad legal para representar a la empresa.'}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
