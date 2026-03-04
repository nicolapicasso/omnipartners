'use client'

import { useState } from 'react'
import { Save, Plus, Trash2, Settings, Users, User, Target, FileText, Award, Calendar, X } from 'lucide-react'
import {
  updateGlobalRequirements,
  upsertCategoryRequirements,
  deleteCategoryRequirements,
  createPartnerOverride,
  deletePartnerOverride,
  DEFAULT_REQUIREMENTS,
} from './actions'

type RequirementConfig = {
  id: string
  scope: string
  partnerCategory: string | null
  partnerId: string | null
  leadsPerYear: number
  prospectsPerYear: number
  clientsPerYear: number
  eventsPerYear: number
  certificationRequired: boolean
  contractRequired: boolean
  omniwalletRequired: boolean
} | null

type PartnerOverrideWithInfo = {
  id: string
  scope: string
  partnerCategory: string | null
  partnerId: string | null
  leadsPerYear: number
  prospectsPerYear: number
  clientsPerYear: number
  eventsPerYear: number
  certificationRequired: boolean
  contractRequired: boolean
  omniwalletRequired: boolean
  partner: {
    id: string
    companyName: string
    partnerCategory: string
  } | null
}

type PartnerInfo = {
  id: string
  companyName: string
  partnerCategory: string
}

const PARTNER_CATEGORIES = [
  { value: 'AGENCY_PARTNER', label: 'Agency Partner' },
  { value: 'TECH_PARTNER', label: 'Tech Partner' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'CUSTOM', label: 'Custom' },
]

export default function RequirementsManagement({
  globalConfig,
  categoryConfigs,
  partnerOverrides,
  allPartners,
}: {
  globalConfig: RequirementConfig
  categoryConfigs: RequirementConfig[]
  partnerOverrides: PartnerOverrideWithInfo[]
  allPartners: PartnerInfo[]
}) {
  const [activeTab, setActiveTab] = useState<'global' | 'categories' | 'partners'>('global')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Requisitos</h1>
        <p className="text-gray-600 mt-1">
          Define los objetivos anuales que los partners deben cumplir
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'global'
              ? 'border-b-2 border-omniwallet-primary text-omniwallet-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          Requisitos Globales
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-b-2 border-omniwallet-primary text-omniwallet-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Por Categoría
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'partners'
              ? 'border-b-2 border-omniwallet-primary text-omniwallet-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          Por Partner
        </button>
      </div>

      {activeTab === 'global' && (
        <GlobalRequirementsForm config={globalConfig} />
      )}

      {activeTab === 'categories' && (
        <CategoryRequirementsForm
          configs={categoryConfigs}
          globalConfig={globalConfig}
        />
      )}

      {activeTab === 'partners' && (
        <PartnerOverridesForm
          overrides={partnerOverrides}
          allPartners={allPartners}
          globalConfig={globalConfig}
          categoryConfigs={categoryConfigs}
        />
      )}
    </div>
  )
}

// Global Requirements Form
function GlobalRequirementsForm({ config }: { config: RequirementConfig }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    leadsPerYear: config?.leadsPerYear ?? DEFAULT_REQUIREMENTS.leadsPerYear,
    prospectsPerYear: config?.prospectsPerYear ?? DEFAULT_REQUIREMENTS.prospectsPerYear,
    clientsPerYear: config?.clientsPerYear ?? DEFAULT_REQUIREMENTS.clientsPerYear,
    eventsPerYear: config?.eventsPerYear ?? DEFAULT_REQUIREMENTS.eventsPerYear,
    certificationRequired: config?.certificationRequired ?? DEFAULT_REQUIREMENTS.certificationRequired,
    contractRequired: config?.contractRequired ?? DEFAULT_REQUIREMENTS.contractRequired,
    omniwalletRequired: config?.omniwalletRequired ?? DEFAULT_REQUIREMENTS.omniwalletRequired,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateGlobalRequirements(formData)

    if (result.success) {
      alert('Requisitos globales actualizados correctamente')
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-omniwallet-primary/10 rounded-lg">
          <Settings className="w-6 h-6 text-omniwallet-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Requisitos por Defecto</h2>
          <p className="text-sm text-gray-500">
            Estos valores aplican a todos los partners que no tengan configuración específica
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Leads por Año
            </label>
            <input
              type="number"
              value={formData.leadsPerYear}
              onChange={(e) => setFormData({ ...formData, leadsPerYear: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Prospects/Demos por Año
            </label>
            <input
              type="number"
              value={formData.prospectsPerYear}
              onChange={(e) => setFormData({ ...formData, prospectsPerYear: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Clientes por Año
            </label>
            <input
              type="number"
              value={formData.clientsPerYear}
              onChange={(e) => setFormData({ ...formData, clientsPerYear: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Eventos por Año
            </label>
            <input
              type="number"
              value={formData.eventsPerYear}
              onChange={(e) => setFormData({ ...formData, eventsPerYear: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.certificationRequired}
              onChange={(e) => setFormData({ ...formData, certificationRequired: e.target.checked })}
              className="w-4 h-4 text-omniwallet-primary focus:ring-omniwallet-primary rounded"
            />
            <Award className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Certificación requerida</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.contractRequired}
              onChange={(e) => setFormData({ ...formData, contractRequired: e.target.checked })}
              className="w-4 h-4 text-omniwallet-primary focus:ring-omniwallet-primary rounded"
            />
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Contrato requerido</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.omniwalletRequired}
              onChange={(e) => setFormData({ ...formData, omniwalletRequired: e.target.checked })}
              className="w-4 h-4 text-omniwallet-primary focus:ring-omniwallet-primary rounded"
            />
            <span className="text-sm font-medium text-gray-700">Cuenta Omniwallet requerida</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </form>
    </div>
  )
}

// Category Requirements Form
function CategoryRequirementsForm({
  configs,
  globalConfig
}: {
  configs: RequirementConfig[]
  globalConfig: RequirementConfig
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [formData, setFormData] = useState({
    leadsPerYear: globalConfig?.leadsPerYear ?? DEFAULT_REQUIREMENTS.leadsPerYear,
    prospectsPerYear: globalConfig?.prospectsPerYear ?? DEFAULT_REQUIREMENTS.prospectsPerYear,
    clientsPerYear: globalConfig?.clientsPerYear ?? DEFAULT_REQUIREMENTS.clientsPerYear,
    eventsPerYear: globalConfig?.eventsPerYear ?? DEFAULT_REQUIREMENTS.eventsPerYear,
    certificationRequired: globalConfig?.certificationRequired ?? DEFAULT_REQUIREMENTS.certificationRequired,
    contractRequired: globalConfig?.contractRequired ?? DEFAULT_REQUIREMENTS.contractRequired,
    omniwalletRequired: globalConfig?.omniwalletRequired ?? DEFAULT_REQUIREMENTS.omniwalletRequired,
  })

  // Categories that already have config
  const configuredCategories = configs
    .map(c => c?.partnerCategory)
    .filter(Boolean) as string[]

  // Available categories to add
  const availableCategories = PARTNER_CATEGORIES.filter(
    cat => !configuredCategories.includes(cat.value)
  )

  const handleSave = async () => {
    if (!selectedCategory) return
    setLoading(selectedCategory)

    const result = await upsertCategoryRequirements(selectedCategory, formData)

    if (result.success) {
      setShowForm(false)
      setSelectedCategory('')
      window.location.reload()
    } else {
      alert(result.error)
    }

    setLoading(null)
  }

  const handleDelete = async (category: string) => {
    if (!confirm(`¿Eliminar configuración para ${category}? Se usarán los valores globales.`)) return
    setLoading(category)

    const result = await deleteCategoryRequirements(category)

    if (result.success) {
      window.location.reload()
    } else {
      alert(result.error)
    }

    setLoading(null)
  }

  const editCategory = (config: RequirementConfig) => {
    if (!config) return
    setSelectedCategory(config.partnerCategory || '')
    setFormData({
      leadsPerYear: config.leadsPerYear,
      prospectsPerYear: config.prospectsPerYear,
      clientsPerYear: config.clientsPerYear,
      eventsPerYear: config.eventsPerYear,
      certificationRequired: config.certificationRequired,
      contractRequired: config.contractRequired,
      omniwalletRequired: config.omniwalletRequired,
    })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Requisitos por Categoría</h2>
          <p className="text-sm text-gray-500">
            Define requisitos específicos para cada tipo de partner
          </p>
        </div>
        {!showForm && availableCategories.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
          >
            <Plus className="w-4 h-4" />
            Agregar Categoría
          </button>
        )}
      </div>

      {/* Form for adding/editing */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {configuredCategories.includes(selectedCategory) ? 'Editar' : 'Nueva'} Configuración por Categoría
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría de Partner</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              disabled={configuredCategories.includes(selectedCategory)}
            >
              <option value="">Selecciona una categoría</option>
              {(configuredCategories.includes(selectedCategory)
                ? PARTNER_CATEGORIES
                : availableCategories
              ).map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leads/Año</label>
              <input
                type="number"
                value={formData.leadsPerYear}
                onChange={(e) => setFormData({ ...formData, leadsPerYear: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prospects/Año</label>
              <input
                type="number"
                value={formData.prospectsPerYear}
                onChange={(e) => setFormData({ ...formData, prospectsPerYear: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clientes/Año</label>
              <input
                type="number"
                value={formData.clientsPerYear}
                onChange={(e) => setFormData({ ...formData, clientsPerYear: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eventos/Año</label>
              <input
                type="number"
                value={formData.eventsPerYear}
                onChange={(e) => setFormData({ ...formData, eventsPerYear: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.certificationRequired}
                onChange={(e) => setFormData({ ...formData, certificationRequired: e.target.checked })}
                className="w-4 h-4 text-omniwallet-primary rounded"
              />
              <span className="text-sm text-gray-700">Certificación</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.contractRequired}
                onChange={(e) => setFormData({ ...formData, contractRequired: e.target.checked })}
                className="w-4 h-4 text-omniwallet-primary rounded"
              />
              <span className="text-sm text-gray-700">Contrato</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.omniwalletRequired}
                onChange={(e) => setFormData({ ...formData, omniwalletRequired: e.target.checked })}
                className="w-4 h-4 text-omniwallet-primary rounded"
              />
              <span className="text-sm text-gray-700">Cuenta Omniwallet</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!selectedCategory || loading === selectedCategory}
              className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              onClick={() => { setShowForm(false); setSelectedCategory(''); }}
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List of configured categories */}
      <div className="space-y-4">
        {configs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay configuraciones por categoría</p>
            <p className="text-sm text-gray-400 mt-1">
              Todos los partners usan los requisitos globales
            </p>
          </div>
        ) : (
          configs.map((config) => {
            if (!config) return null
            const category = PARTNER_CATEGORIES.find(c => c.value === config.partnerCategory)
            return (
              <div key={config.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-omniwallet-primary/10 text-omniwallet-primary rounded-full text-sm font-medium">
                      {category?.label || config.partnerCategory}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editCategory(config)}
                      className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(config.partnerCategory!)}
                      disabled={loading === config.partnerCategory}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Leads:</span>
                    <span className="ml-2 font-medium">{config.leadsPerYear}/año</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Prospects:</span>
                    <span className="ml-2 font-medium">{config.prospectsPerYear}/año</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Clientes:</span>
                    <span className="ml-2 font-medium">{config.clientsPerYear}/año</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Eventos:</span>
                    <span className="ml-2 font-medium">{config.eventsPerYear}/año</span>
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

// Partner Overrides Form
function PartnerOverridesForm({
  overrides,
  allPartners,
  globalConfig,
  categoryConfigs,
}: {
  overrides: PartnerOverrideWithInfo[]
  allPartners: PartnerInfo[]
  globalConfig: RequirementConfig
  categoryConfigs: RequirementConfig[]
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [formData, setFormData] = useState({
    leadsPerYear: globalConfig?.leadsPerYear ?? DEFAULT_REQUIREMENTS.leadsPerYear,
    prospectsPerYear: globalConfig?.prospectsPerYear ?? DEFAULT_REQUIREMENTS.prospectsPerYear,
    clientsPerYear: globalConfig?.clientsPerYear ?? DEFAULT_REQUIREMENTS.clientsPerYear,
    eventsPerYear: globalConfig?.eventsPerYear ?? DEFAULT_REQUIREMENTS.eventsPerYear,
    certificationRequired: globalConfig?.certificationRequired ?? DEFAULT_REQUIREMENTS.certificationRequired,
    contractRequired: globalConfig?.contractRequired ?? DEFAULT_REQUIREMENTS.contractRequired,
    omniwalletRequired: globalConfig?.omniwalletRequired ?? DEFAULT_REQUIREMENTS.omniwalletRequired,
  })

  // Partners that already have overrides
  const overridePartnerIds = overrides.map(o => o.partnerId).filter(Boolean)

  // Available partners to add
  const availablePartners = allPartners.filter(p => !overridePartnerIds.includes(p.id))

  const handleSave = async () => {
    if (!selectedPartnerId) return
    setLoading(selectedPartnerId)

    const result = await createPartnerOverride(selectedPartnerId, formData)

    if (result.success) {
      setShowForm(false)
      setSelectedPartnerId('')
      window.location.reload()
    } else {
      alert(result.error)
    }

    setLoading(null)
  }

  const handleDelete = async (partnerId: string) => {
    if (!confirm('¿Eliminar configuración personalizada? Se usarán los valores de categoría o globales.')) return
    setLoading(partnerId)

    const result = await deletePartnerOverride(partnerId)

    if (result.success) {
      window.location.reload()
    } else {
      alert(result.error)
    }

    setLoading(null)
  }

  const handlePartnerSelect = (partnerId: string) => {
    setSelectedPartnerId(partnerId)

    // Find partner's category and pre-fill with category config or global
    const partner = allPartners.find(p => p.id === partnerId)
    if (partner) {
      const categoryConfig = categoryConfigs.find(c => c?.partnerCategory === partner.partnerCategory)
      const baseConfig = categoryConfig || globalConfig

      if (baseConfig) {
        setFormData({
          leadsPerYear: baseConfig.leadsPerYear,
          prospectsPerYear: baseConfig.prospectsPerYear,
          clientsPerYear: baseConfig.clientsPerYear,
          eventsPerYear: baseConfig.eventsPerYear,
          certificationRequired: baseConfig.certificationRequired,
          contractRequired: baseConfig.contractRequired,
          omniwalletRequired: baseConfig.omniwalletRequired,
        })
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Requisitos por Partner</h2>
          <p className="text-sm text-gray-500">
            Configura requisitos personalizados para partners específicos
          </p>
        </div>
        {!showForm && availablePartners.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
          >
            <Plus className="w-4 h-4" />
            Agregar Override
          </button>
        )}
      </div>

      {/* Form for adding */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nueva Configuración Personalizada
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Partner</label>
            <select
              value={selectedPartnerId}
              onChange={(e) => handlePartnerSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            >
              <option value="">Selecciona un partner</option>
              {availablePartners.map(partner => (
                <option key={partner.id} value={partner.id}>
                  {partner.companyName} ({PARTNER_CATEGORIES.find(c => c.value === partner.partnerCategory)?.label})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leads/Año</label>
              <input
                type="number"
                value={formData.leadsPerYear}
                onChange={(e) => setFormData({ ...formData, leadsPerYear: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prospects/Año</label>
              <input
                type="number"
                value={formData.prospectsPerYear}
                onChange={(e) => setFormData({ ...formData, prospectsPerYear: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clientes/Año</label>
              <input
                type="number"
                value={formData.clientsPerYear}
                onChange={(e) => setFormData({ ...formData, clientsPerYear: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eventos/Año</label>
              <input
                type="number"
                value={formData.eventsPerYear}
                onChange={(e) => setFormData({ ...formData, eventsPerYear: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.certificationRequired}
                onChange={(e) => setFormData({ ...formData, certificationRequired: e.target.checked })}
                className="w-4 h-4 text-omniwallet-primary rounded"
              />
              <span className="text-sm text-gray-700">Certificación</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.contractRequired}
                onChange={(e) => setFormData({ ...formData, contractRequired: e.target.checked })}
                className="w-4 h-4 text-omniwallet-primary rounded"
              />
              <span className="text-sm text-gray-700">Contrato</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.omniwalletRequired}
                onChange={(e) => setFormData({ ...formData, omniwalletRequired: e.target.checked })}
                className="w-4 h-4 text-omniwallet-primary rounded"
              />
              <span className="text-sm text-gray-700">Cuenta Omniwallet</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!selectedPartnerId || loading === selectedPartnerId}
              className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              onClick={() => { setShowForm(false); setSelectedPartnerId(''); }}
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List of partner overrides */}
      <div className="space-y-4">
        {overrides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay configuraciones personalizadas</p>
            <p className="text-sm text-gray-400 mt-1">
              Todos los partners usan los requisitos de su categoría o los globales
            </p>
          </div>
        ) : (
          overrides.map((override) => {
            const category = PARTNER_CATEGORIES.find(c => c.value === override.partner?.partnerCategory)
            return (
              <div key={override.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{override.partner?.companyName || 'Unknown'}</h3>
                    <span className="text-sm text-gray-500">{category?.label || override.partner?.partnerCategory}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(override.partnerId!)}
                    disabled={loading === override.partnerId}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Leads:</span>
                    <span className="ml-2 font-medium">{override.leadsPerYear}/año</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Prospects:</span>
                    <span className="ml-2 font-medium">{override.prospectsPerYear}/año</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Clientes:</span>
                    <span className="ml-2 font-medium">{override.clientsPerYear}/año</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Eventos:</span>
                    <span className="ml-2 font-medium">{override.eventsPerYear}/año</span>
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
