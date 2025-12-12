'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CommissionType } from '@/types'
import { createLead } from '../actions'
import { Loader2, Save, Building2, User, Mail, Globe, MapPin, FileText, Briefcase } from 'lucide-react'
import CountrySelect from '@/components/CountrySelect'
import PhoneInput from '@/components/PhoneInput'
import ContactForm, { ContactData } from '@/components/ContactForm'

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
    phoneCountryCode: '+34',
    jobTitle: '',
    country: 'Spain', // Por defecto España
    website: '',
    notes: '',
    partnerId: partners[0]?.id || '',
    commissionType: CommissionType.REFERRAL,
    commissionRate: '10',
  })

  const [contacts, setContacts] = useState<ContactData[]>([])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePhoneChange = (fullPhone: string) => {
    const parts = fullPhone.split(' ')
    const phoneCountryCode = parts[0] || '+34'
    const phone = parts.slice(1).join(' ')
    setFormData({ ...formData, phone, phoneCountryCode })
  }

  const getFullPhone = () => {
    if (!formData.phone) return ''
    return `${formData.phoneCountryCode || '+34'} ${formData.phone}`.trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validar contactos adicionales
    for (let i = 0; i < contacts.length; i++) {
      if (!contacts[i].name || !contacts[i].email) {
        setError(`Por favor completa el nombre y email del contacto ${i + 1}`)
        setLoading(false)
        return
      }
    }

    try {
      const result = await createLead({
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone || undefined,
        phoneCountryCode: formData.phoneCountryCode || undefined,
        jobTitle: formData.jobTitle || undefined,
        country: formData.country,
        website: formData.website || undefined,
        notes: formData.notes || undefined,
        partnerId: formData.partnerId,
        commissionType: formData.commissionType as CommissionType,
        commissionRate: parseFloat(formData.commissionRate),
        contacts: contacts.length > 0 ? contacts : undefined,
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
      {/* Información de la Empresa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Información de la Empresa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa *
            </label>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              País *
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <CountrySelect
                value={formData.country}
                onChange={(value) => setFormData({ ...formData, country: value })}
                required
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Sitio Web
            </label>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400" />
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="https://www.empresa.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacto Principal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contacto Principal</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Contacto *
            </label>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <input
                id="contactName"
                name="contactName"
                type="text"
                value={formData.contactName}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Cargo
            </label>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                value={formData.jobTitle}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="Director Comercial"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="contacto@empresa.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <PhoneInput value={getFullPhone()} onChange={handlePhoneChange} className="w-full" />
          </div>
        </div>
      </div>

      {/* Contactos Adicionales */}
      <div className="border-t border-gray-200 pt-6">
        <ContactForm contacts={contacts} onChange={setContacts} />
      </div>

      {/* Configuración del Partner */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Asignación y Comisión</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Notas */}
      <div className="border-t border-gray-200 pt-6">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notas
        </label>
        <div className="flex gap-2">
          <FileText className="w-5 h-5 text-gray-400 mt-2" />
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
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
