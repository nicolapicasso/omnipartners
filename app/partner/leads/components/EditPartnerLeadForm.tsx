'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updatePartnerLead } from '../actions'
import { Building2, User, Mail, Phone, Globe, MapPin, FileText, Briefcase } from 'lucide-react'
import CountrySelect from '@/components/CountrySelect'
import PhoneInput from '@/components/PhoneInput'
import ContactForm, { ContactData } from '@/components/ContactForm'

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  phoneCountryCode: string | null
  jobTitle: string | null
  isPrimary: boolean
}

interface Lead {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string | null
  phoneCountryCode?: string | null
  jobTitle?: string | null
  country: string
  website: string | null
  notes: string | null
  contacts?: Contact[]
}

export default function EditPartnerLeadForm({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Extraer código de país y número del teléfono existente
  const parseExistingPhone = () => {
    if (lead.phoneCountryCode && lead.phone) {
      return { phoneCountryCode: lead.phoneCountryCode, phone: lead.phone }
    }
    if (lead.phone) {
      const parts = lead.phone.split(' ')
      if (parts[0]?.startsWith('+')) {
        return { phoneCountryCode: parts[0], phone: parts.slice(1).join(' ') }
      }
    }
    return { phoneCountryCode: '+34', phone: lead.phone || '' }
  }

  const { phoneCountryCode: initialCountryCode, phone: initialPhone } = parseExistingPhone()

  const [formData, setFormData] = useState({
    companyName: lead.companyName,
    contactName: lead.contactName,
    email: lead.email,
    phone: initialPhone,
    phoneCountryCode: initialCountryCode,
    jobTitle: lead.jobTitle || '',
    country: lead.country,
    website: lead.website || '',
    notes: lead.notes || '',
  })

  const [contacts, setContacts] = useState<ContactData[]>(
    lead.contacts?.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      phoneCountryCode: c.phoneCountryCode || '+34',
      jobTitle: c.jobTitle || '',
      isPrimary: c.isPrimary,
    })) || []
  )

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
    setLoading(true)
    setError('')

    // Validation
    if (!formData.companyName || !formData.contactName || !formData.email || !formData.country) {
      setError('Por favor completa todos los campos obligatorios')
      setLoading(false)
      return
    }

    // Validar contactos adicionales
    for (let i = 0; i < contacts.length; i++) {
      if (!contacts[i].name || !contacts[i].email) {
        setError(`Por favor completa el nombre y email del contacto ${i + 1}`)
        setLoading(false)
        return
      }
    }

    const result = await updatePartnerLead(lead.id, {
      companyName: formData.companyName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone || undefined,
      phoneCountryCode: formData.phoneCountryCode || undefined,
      jobTitle: formData.jobTitle || undefined,
      country: formData.country,
      website: formData.website || undefined,
      notes: formData.notes || undefined,
      contacts: contacts.length > 0 ? contacts : undefined,
    })

    if (result.success) {
      router.push(`/partner/leads/${lead.id}`)
    } else {
      setError(result.error || 'Error al actualizar el lead')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Información de la Empresa</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Empresa *
          </label>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              placeholder="Ej: Acme Corp"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">País *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sitio Web (opcional)
          </label>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              placeholder="Ej: https://acme.com"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Contacto Principal</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Contacto *
            </label>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo (opcional)
            </label>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="Ej: Director Comercial"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              placeholder="Ej: juan@acme.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono (opcional)
          </label>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <PhoneInput
              value={getFullPhone()}
              onChange={handlePhoneChange}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <ContactForm contacts={contacts} onChange={setContacts} />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <div className="flex gap-2">
            <FileText className="w-5 h-5 text-gray-400 mt-2" />
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              placeholder="Información adicional sobre el lead..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-omniwallet-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-omniwallet-secondary transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}
