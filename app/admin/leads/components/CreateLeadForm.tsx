'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CommissionType } from '@/types'
import { createLead } from '../actions'
import { Loader2, Save } from 'lucide-react'

interface Partner {
  id: string
  companyName: string
  email: string
}

export default function CreateLeadForm({ partners }: { partners: Partner[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    country: '',
    website: '',
    notes: '',
    partnerId: partners[0]?.id || '',
    commissionType: CommissionType.REFERRAL,
    commissionRate: '10',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await createLead({
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone || undefined,
        country: formData.country,
        website: formData.website || undefined,
        notes: formData.notes || undefined,
        partnerId: formData.partnerId,
        commissionType: formData.commissionType as CommissionType,
        commissionRate: parseFloat(formData.commissionRate),
      })

      if (result.success) {
        router.push(`/admin/leads/${result.leadId}`)
      } else {
        setError(result.error || 'Error al crear el lead')
        setLoading(false)
      }
    } catch (err) {
      setError('Error al crear el lead')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="md:col-span-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Empresa *
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="Acme Corp"
          />
        </div>

        {/* Contact Name */}
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Contacto *
          </label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            value={formData.contactName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="Juan Pérez"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="contacto@empresa.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="+34 600 000 000"
          />
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            País *
          </label>
          <input
            id="country"
            name="country"
            type="text"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="España"
          />
        </div>

        {/* Website */}
        <div className="md:col-span-2">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Sitio Web
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="https://www.empresa.com"
          />
        </div>

        {/* Partner */}
        <div className="md:col-span-2">
          <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700 mb-2">
            Asignar a Partner *
          </label>
          <select
            id="partnerId"
            name="partnerId"
            value={formData.partnerId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          >
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.companyName} ({partner.email})
              </option>
            ))}
          </select>
        </div>

        {/* Commission Type */}
        <div>
          <label
            htmlFor="commissionType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tipo de Comisión *
          </label>
          <select
            id="commissionType"
            name="commissionType"
            value={formData.commissionType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          >
            <option value={CommissionType.AGENCY_PARTNER}>Agency Partner</option>
            <option value={CommissionType.TECH_PARTNER}>Tech Partner</option>
            <option value={CommissionType.REFERRAL}>Referral</option>
            <option value={CommissionType.CUSTOM}>Custom</option>
          </select>
        </div>

        {/* Commission Rate */}
        <div>
          <label
            htmlFor="commissionRate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tasa de Comisión (%) *
          </label>
          <input
            id="commissionRate"
            name="commissionRate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.commissionRate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="10.0"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="Notas adicionales sobre el lead..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-omniwallet-primary text-white py-3 rounded-lg font-semibold hover:bg-omniwallet-secondary transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creando Lead...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Crear Lead
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
