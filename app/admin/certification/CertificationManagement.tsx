'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, Award, Users, Settings, CheckCircle, XCircle, ExternalLink, Image, Clock } from 'lucide-react'
import {
  createCertificationContent,
  updateCertificationContent,
  deleteCertificationContent,
  createCertificationQuestion,
  updateCertificationQuestion,
  deleteCertificationQuestion,
  updateCertificationSettings,
  grantCertification,
  revokeCertification,
  updatePartnerLandingUrl,
} from './actions'
import { useTranslation } from '@/lib/contexts/LanguageContext'

type ContentItem = {
  id: string
  title: string
  content: string
  description: string | null
  type: string
  url: string | null
  order: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

type QuestionItem = {
  id: string
  question: string
  options: string
  correctAnswer: number
  explanation: string | null
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type SettingsItem = {
  id: string
  badgeLightUrl: string | null
  badgeDarkUrl: string | null
  badgeHoverText: string | null
  badgeAltText: string | null
  validityMonths: number
} | null

type PartnerItem = {
  id: string
  companyName: string
  contactName: string
  email: string
  website: string | null
  isCertified: boolean
  certifiedAt: Date | null
  certificationExpiresAt: Date | null
  partnerLandingUrl: string | null
  bestScore: number | null
  attemptCount: number
}

export default function CertificationManagement({
  contents,
  questions,
  settings,
  partners,
}: {
  contents: ContentItem[]
  questions: QuestionItem[]
  settings: SettingsItem
  partners: PartnerItem[]
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'content' | 'questions' | 'settings' | 'partners'>('content')

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('admin.manageCertification')}</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap ${
            activeTab === 'content'
              ? 'border-b-2 border-omniwallet-primary text-omniwallet-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('certification.studyMaterials')}
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap ${
            activeTab === 'questions'
              ? 'border-b-2 border-omniwallet-primary text-omniwallet-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('certification.adminQuestions.title')}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-b-2 border-omniwallet-primary text-omniwallet-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          Gestionar Sello
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'partners'
              ? 'border-b-2 border-omniwallet-primary text-omniwallet-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Partners Certificados
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && <ContentManagement contents={contents} />}

      {/* Questions Tab */}
      {activeTab === 'questions' && <QuestionManagement questions={questions} />}

      {/* Settings Tab */}
      {activeTab === 'settings' && <BadgeSettingsManagement settings={settings} />}

      {/* Partners Tab */}
      {activeTab === 'partners' && <PartnersManagement partners={partners} />}
    </div>
  )
}

// Badge Settings Management Component
function BadgeSettingsManagement({ settings }: { settings: SettingsItem }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    badgeLightUrl: settings?.badgeLightUrl || '',
    badgeDarkUrl: settings?.badgeDarkUrl || '',
    badgeHoverText: settings?.badgeHoverText || '{partnerName} está certificado por Omniwallet como expertos en Loyalty Marketing',
    badgeAltText: settings?.badgeAltText || 'Partner Certificado Omniwallet',
    validityMonths: settings?.validityMonths || 12,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateCertificationSettings(formData)

    if (result.success) {
      alert('Configuración guardada correctamente')
      window.location.reload()
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuración del Sello de Certificación</h2>
        <p className="text-sm text-gray-600">
          Configura las imágenes del sello y los textos que se mostrarán cuando un partner lo añada a su web.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Badge Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                URL Sello Versión Clara
              </label>
              <input
                type="url"
                value={formData.badgeLightUrl}
                onChange={(e) => setFormData({ ...formData, badgeLightUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="https://..."
              />
              {formData.badgeLightUrl && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <img
                    src={formData.badgeLightUrl}
                    alt="Preview Light"
                    className="h-16 object-contain"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                URL Sello Versión Oscura
              </label>
              <input
                type="url"
                value={formData.badgeDarkUrl}
                onChange={(e) => setFormData({ ...formData, badgeDarkUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="https://..."
              />
              {formData.badgeDarkUrl && (
                <div className="mt-2 p-2 bg-gray-800 rounded">
                  <img
                    src={formData.badgeDarkUrl}
                    alt="Preview Dark"
                    className="h-16 object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hover Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto al hacer Hover
            </label>
            <textarea
              value={formData.badgeHoverText}
              onChange={(e) => setFormData({ ...formData, badgeHoverText: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables disponibles: {'{partnerName}'}, {'{expirationDate}'}, {'{score}'}
            </p>
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto Alternativo (Accesibilidad)
            </label>
            <input
              type="text"
              value={formData.badgeAltText}
              onChange={(e) => setFormData({ ...formData, badgeAltText: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            />
          </div>

          {/* Validity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Meses de Validez de la Certificación
            </label>
            <input
              type="number"
              value={formData.validityMonths}
              onChange={(e) => setFormData({ ...formData, validityMonths: parseInt(e.target.value) || 12 })}
              min="1"
              max="60"
              className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Las certificaciones expirarán después de este período.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Partners Management Component
function PartnersManagement({ partners }: { partners: PartnerItem[] }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [editingLanding, setEditingLanding] = useState<string | null>(null)
  const [landingUrl, setLandingUrl] = useState('')

  const certifiedPartners = partners.filter(p => p.isCertified)
  const nonCertifiedPartners = partners.filter(p => !p.isCertified)

  const handleGrant = async (partnerId: string) => {
    if (!confirm('¿Conceder certificación a este partner?')) return
    setLoading(partnerId)
    const result = await grantCertification(partnerId)
    if (result.success) {
      window.location.reload()
    } else {
      alert(result.error)
    }
    setLoading(null)
  }

  const handleRevoke = async (partnerId: string) => {
    if (!confirm('¿Revocar certificación de este partner?')) return
    setLoading(partnerId)
    const result = await revokeCertification(partnerId)
    if (result.success) {
      window.location.reload()
    } else {
      alert(result.error)
    }
    setLoading(null)
  }

  const handleSaveLanding = async (partnerId: string) => {
    setLoading(partnerId)
    const result = await updatePartnerLandingUrl(partnerId, landingUrl)
    if (result.success) {
      setEditingLanding(null)
      window.location.reload()
    } else {
      alert(result.error)
    }
    setLoading(null)
  }

  const startEditLanding = (partner: PartnerItem) => {
    setEditingLanding(partner.id)
    setLandingUrl(partner.partnerLandingUrl || '')
  }

  return (
    <div>
      {/* Certified Partners */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Partners Certificados ({certifiedPartners.length})
          </h2>
        </div>

        {certifiedPartners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No hay partners certificados todavía.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mejor Puntuación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Landing URL</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certifiedPartners.map((partner) => (
                  <tr key={partner.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{partner.companyName}</p>
                        <p className="text-sm text-gray-500">{partner.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {partner.bestScore !== null ? (
                        <span className="text-green-600 font-medium">{partner.bestScore.toFixed(1)}%</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {partner.certifiedAt ? new Date(partner.certifiedAt).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {partner.certificationExpiresAt ? (
                        <span className={`text-sm ${
                          new Date(partner.certificationExpiresAt) < new Date() ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {new Date(partner.certificationExpiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingLanding === partner.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={landingUrl}
                            onChange={(e) => setLandingUrl(e.target.value)}
                            className="w-48 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="https://..."
                          />
                          <button
                            onClick={() => handleSaveLanding(partner.id)}
                            disabled={loading === partner.id}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingLanding(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {partner.partnerLandingUrl ? (
                            <a
                              href={partner.partnerLandingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm flex items-center gap-1"
                            >
                              Ver <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">No configurada</span>
                          )}
                          <button
                            onClick={() => startEditLanding(partner)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevoke(partner.id)}
                        disabled={loading === partner.id}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        Revocar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Non-Certified Partners */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Partners sin Certificar ({nonCertifiedPartners.length})
          </h2>
        </div>

        {nonCertifiedPartners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Todos los partners activos están certificados.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intentos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mejor Puntuación</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nonCertifiedPartners.map((partner) => (
                  <tr key={partner.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{partner.companyName}</p>
                        <p className="text-sm text-gray-500">{partner.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{partner.attemptCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      {partner.bestScore !== null ? (
                        <span className={`font-medium ${partner.bestScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {partner.bestScore.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">Sin intentos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleGrant(partner.id)}
                        disabled={loading === partner.id}
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                      >
                        <Award className="w-4 h-4" />
                        Conceder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Content Management Component
function ContentManagement({ contents }: { contents: ContentItem[] }) {
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'TEXT',
    url: '',
    order: contents.length,
    isPublished: false,
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      type: 'TEXT',
      url: '',
      order: contents.length,
      isPublished: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (content: ContentItem) => {
    setFormData({
      title: content.title,
      description: content.description || '',
      content: content.content,
      type: content.type,
      url: content.url || '',
      order: content.order,
      isPublished: content.isPublished,
    })
    setEditingId(content.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = editingId
      ? await updateCertificationContent(editingId, formData)
      : await createCertificationContent(formData)

    if (result.success) {
      resetForm()
      window.location.reload()
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.delete') + '?')) return

    setLoading(true)
    const result = await deleteCertificationContent(id)

    if (result.success) {
      window.location.reload()
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t('certification.studyMaterials')}</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
          >
            <Plus className="w-4 h-4" />
            {t('certification.adminContent.addContent')}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? t('certification.adminContent.editContent') : t('certification.adminContent.addContent')}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminContent.contentTitle')} *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminContent.contentDescription')}</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminContent.contentType')} *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              >
                <option value="TEXT">Text</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
                <option value="EXTERNAL_LINK">External Link</option>
              </select>
            </div>

            {(formData.type === 'VIDEO' || formData.type === 'DOCUMENT' || formData.type === 'EXTERNAL_LINK') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminContent.contentUrl')}</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminContent.content')} *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder="Markdown supported"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminContent.order')}</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mt-7">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-omniwallet-primary focus:ring-omniwallet-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('certification.adminContent.published')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? t('common.submitting') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition"
            >
              <X className="w-4 h-4" />
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Content List */}
      <div className="space-y-4">
        {contents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">{t('certification.adminContent.noContent')}</p>
          </div>
        ) : (
          contents.map((content) => (
            <div key={content.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {content.type}
                    </span>
                    {content.isPublished ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {t('certification.adminContent.published')}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        Draft
                      </span>
                    )}
                  </div>
                  {content.description && (
                    <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                  )}
                  <p className="text-sm text-gray-500">{t('certification.adminContent.order')}: {content.order}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(content)}
                    className="p-2 text-omniwallet-primary hover:bg-omniwallet-primary/10 rounded-md transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(content.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Question Management Component
function QuestionManagement({ questions }: { questions: QuestionItem[] }) {
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    order: questions.length,
    isActive: true,
  })

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      order: questions.length,
      isActive: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (question: QuestionItem) => {
    setFormData({
      question: question.question,
      options: JSON.parse(question.options),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      order: question.order,
      isActive: question.isActive,
    })
    setEditingId(question.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = editingId
      ? await updateCertificationQuestion(editingId, formData)
      : await createCertificationQuestion(formData)

    if (result.success) {
      resetForm()
      window.location.reload()
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.delete') + '?')) return

    setLoading(true)
    const result = await deleteCertificationQuestion(id)

    if (result.success) {
      window.location.reload()
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t('certification.adminQuestions.title')}</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
          >
            <Plus className="w-4 h-4" />
            {t('certification.adminQuestions.addQuestion')}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? t('certification.adminQuestions.editQuestion') : t('certification.adminQuestions.addQuestion')}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminQuestions.questionText')} *</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('certification.adminQuestions.options')} *</label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-8">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminQuestions.correctAnswer')} *</label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              >
                {formData.options.map((_, index) => (
                  <option key={index} value={index}>
                    {String.fromCharCode(65 + index)}. {formData.options[index] || `${t('certification.adminQuestions.option')} ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminQuestions.explanation')}</label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                placeholder={t('certification.adminQuestions.explanation')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('certification.adminQuestions.order')}</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mt-7">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-omniwallet-primary focus:ring-omniwallet-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('certification.adminQuestions.active')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? t('common.submitting') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition"
            >
              <X className="w-4 h-4" />
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Question List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">{t('certification.adminQuestions.noQuestions')}</p>
          </div>
        ) : (
          questions.map((question) => {
            const options = JSON.parse(question.options)
            return (
              <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
                      {question.isActive ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          {t('certification.adminQuestions.active')}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mb-3">
                      {options.map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`text-sm ${
                            index === question.correctAnswer
                              ? 'font-medium text-green-700'
                              : 'text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                          {index === question.correctAnswer && ' ✓'}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <p className="text-sm text-gray-500 italic">{t('certification.adminQuestions.explanation')}: {question.explanation}</p>
                    )}

                    <p className="text-sm text-gray-500 mt-2">{t('certification.adminQuestions.order')}: {question.order}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-omniwallet-primary hover:bg-omniwallet-primary/10 rounded-md transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
