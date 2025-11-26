'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPartnerLead } from '../actions'
import { Building2, User, Mail, Phone, Globe, MapPin, FileText } from 'lucide-react'

export default function CreatePartnerLeadForm() {
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
  })

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

    const result = await createPartnerLead({
      companyName: formData.companyName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone || undefined,
      country: formData.country,
      website: formData.website || undefined,
      notes: formData.notes || undefined,
    })

    if (result.success) {
      router.push(`/partner/leads/${result.leadId}`)
    } else {
      setError(result.error || 'Error al crear el lead')
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
            <Phone className="w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              placeholder="Ej: +34 600 123 456"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">País *</label>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              placeholder="Ej: España"
              required
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

      <div className="bg-omniwallet-primary/10 border border-omniwallet-primary/30 rounded-lg p-4">
        <p className="text-sm text-omniwallet-secondary">
          <strong>Nota:</strong> El administrador asignará la configuración de comisión para este
          lead. Recibirás una notificación cuando se configure.
        </p>
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
          {loading ? 'Creando...' : 'Crear Lead'}
        </button>
      </div>
    </form>
  )
}
