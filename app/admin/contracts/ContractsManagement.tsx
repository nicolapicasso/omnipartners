'use client'

import { useState } from 'react'
import { FileText, Plus, Edit2, Trash2, Eye, Send, X, Check, Clock, Ban, AlertTriangle } from 'lucide-react'
import {
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
  createContractForPartner,
  cancelContract,
} from './actions'

interface Template {
  id: string
  name: string
  partnerCategory: string | null
  content: string
  content_en: string | null
  content_it: string | null
  includeRequirements: boolean
  isActive: boolean
  isDefault: boolean
  order: number
  _count: { contracts: number }
}

interface Contract {
  id: string
  partnerId: string
  templateId: string | null
  status: string
  content: string
  signatoryName: string | null
  signatoryDni: string | null
  signatoryPosition: string | null
  companyCif: string | null
  companyAddress: string | null
  signedAt: Date | null
  signatureIp: string | null
  validFrom: Date | null
  validUntil: Date | null
  createdAt: Date
  partner: {
    id: string
    companyName: string
    contactName: string
    email: string
    partnerCategory: string
  }
  template: {
    id: string
    name: string
  } | null
}

interface Partner {
  id: string
  companyName: string
  partnerCategory: string
  contractUrl: string | null
}

interface ContractsManagementProps {
  templates: Template[]
  contracts: Contract[]
  partners: Partner[]
  statusCounts: {
    pending: number
    signed: number
    cancelled: number
    expired: number
  }
}

const PARTNER_CATEGORIES = [
  { value: 'AGENCY_PARTNER', label: 'Agency Partner' },
  { value: 'TECH_PARTNER', label: 'Tech Partner' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'CUSTOM', label: 'Custom' },
]

const CONTRACT_VARIABLES = [
  { var: '{companyName}', desc: 'Nombre de la empresa del partner' },
  { var: '{contactName}', desc: 'Nombre del contacto principal' },
  { var: '{email}', desc: 'Email del partner' },
  { var: '{address}', desc: 'Direccion del partner' },
  { var: '{date}', desc: 'Fecha actual (dd/mm/yyyy)' },
  { var: '{year}', desc: 'Ano actual' },
]

export default function ContractsManagement({
  templates: initialTemplates,
  contracts: initialContracts,
  partners,
  statusCounts,
}: ContractsManagementProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'contracts'>('templates')
  const [templates, setTemplates] = useState(initialTemplates)
  const [contracts, setContracts] = useState(initialContracts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Template form state
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    partnerCategory: '' as string | null,
    content: '',
    content_en: '',
    content_it: '',
    includeRequirements: true,
    isDefault: false,
  })

  // Contract assignment state
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignPartnerId, setAssignPartnerId] = useState('')
  const [assignTemplateId, setAssignTemplateId] = useState('')

  // Contract view state
  const [viewingContract, setViewingContract] = useState<Contract | null>(null)

  // Contract filter state
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      partnerCategory: null,
      content: '',
      content_en: '',
      content_it: '',
      includeRequirements: true,
      isDefault: false,
    })
    setEditingTemplate(null)
    setShowTemplateForm(false)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      partnerCategory: template.partnerCategory,
      content: template.content,
      content_en: template.content_en || '',
      content_it: template.content_it || '',
      includeRequirements: template.includeRequirements,
      isDefault: template.isDefault,
    })
    setShowTemplateForm(true)
  }

  const handleSaveTemplate = async () => {
    setLoading(true)
    setError(null)

    try {
      if (editingTemplate) {
        const result = await updateContractTemplate(editingTemplate.id, {
          name: templateForm.name,
          partnerCategory: templateForm.partnerCategory || null,
          content: templateForm.content,
          content_en: templateForm.content_en || null,
          content_it: templateForm.content_it || null,
          includeRequirements: templateForm.includeRequirements,
          isDefault: templateForm.isDefault,
        })
        if (result.success) {
          setTemplates(templates.map(t =>
            t.id === editingTemplate.id ? { ...t, ...result.data } : t
          ))
          resetTemplateForm()
        } else {
          setError(result.error || 'Error al actualizar')
        }
      } else {
        const result = await createContractTemplate({
          name: templateForm.name,
          partnerCategory: templateForm.partnerCategory || null,
          content: templateForm.content,
          content_en: templateForm.content_en || undefined,
          content_it: templateForm.content_it || undefined,
          includeRequirements: templateForm.includeRequirements,
          isDefault: templateForm.isDefault,
        })
        if (result.success && result.data) {
          const newTemplate: Template = {
            id: result.data.id,
            name: result.data.name,
            partnerCategory: result.data.partnerCategory,
            content: result.data.content,
            content_en: result.data.content_en,
            content_it: result.data.content_it,
            includeRequirements: result.data.includeRequirements,
            isActive: result.data.isActive,
            isDefault: result.data.isDefault,
            order: result.data.order,
            _count: { contracts: 0 }
          }
          setTemplates([...templates, newTemplate])
          resetTemplateForm()
        } else if (!result.success) {
          setError(result.error || 'Error al crear')
        }
      }
    } catch {
      setError('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta plantilla?')) return

    setLoading(true)
    const result = await deleteContractTemplate(id)
    if (result.success) {
      setTemplates(templates.filter(t => t.id !== id))
    } else {
      setError(result.error || 'Error al eliminar')
    }
    setLoading(false)
  }

  const handleAssignContract = async () => {
    if (!assignPartnerId || !assignTemplateId) return

    setLoading(true)
    setError(null)

    const result = await createContractForPartner(assignPartnerId, assignTemplateId)
    if (result.success) {
      // Reload the page to get updated data
      window.location.reload()
    } else {
      setError(result.error || 'Error al asignar contrato')
    }
    setLoading(false)
  }

  const handleCancelContract = async (contractId: string) => {
    if (!confirm('¿Seguro que deseas cancelar este contrato?')) return

    setLoading(true)
    const result = await cancelContract(contractId)
    if (result.success) {
      setContracts(contracts.map(c =>
        c.id === contractId ? { ...c, status: 'CANCELLED' } : c
      ))
    } else {
      setError(result.error || 'Error al cancelar')
    }
    setLoading(false)
  }

  const filteredContracts = statusFilter === 'all'
    ? contracts
    : contracts.filter(c => c.status === statusFilter)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_SIGNATURE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        )
      case 'SIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3" /> Firmado
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Ban className="w-3 h-3" /> Cancelado
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="w-3 h-3" /> Expirado
          </span>
        )
      default:
        return status
    }
  }

  // Partners without active contract
  const partnersWithoutContract = partners.filter(p => {
    const hasActiveContract = contracts.some(
      c => c.partnerId === p.id && (c.status === 'PENDING_SIGNATURE' || c.status === 'SIGNED')
    )
    return !hasActiveContract
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Contratos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra plantillas de contratos y contratos de partners
          </p>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.signed}</p>
              <p className="text-xs text-gray-500">Firmados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.cancelled}</p>
              <p className="text-xs text-gray-500">Cancelados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.expired}</p>
              <p className="text-xs text-gray-500">Expirados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-omniwallet-primary text-omniwallet-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Plantillas ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contracts'
                ? 'border-omniwallet-primary text-omniwallet-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contratos ({contracts.length})
          </button>
        </nav>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowTemplateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-omniwallet-primary text-white rounded-lg hover:bg-omniwallet-secondary transition"
            >
              <Plus className="w-4 h-4" />
              Nueva Plantilla
            </button>
          </div>

          {/* Template Form Modal */}
          {showTemplateForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </h2>
                  <button onClick={resetTemplateForm} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la plantilla *
                      </label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                        placeholder="Ej: Contrato Agency Partner 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria de Partner
                      </label>
                      <select
                        value={templateForm.partnerCategory || ''}
                        onChange={(e) => setTemplateForm({ ...templateForm, partnerCategory: e.target.value || null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary"
                      >
                        <option value="">Todas las categorias</option>
                        {PARTNER_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={templateForm.includeRequirements}
                        onChange={(e) => setTemplateForm({ ...templateForm, includeRequirements: e.target.checked })}
                        className="rounded border-gray-300 text-omniwallet-primary focus:ring-omniwallet-primary"
                      />
                      <span className="text-sm text-gray-700">Incluir requisitos en el contrato</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={templateForm.isDefault}
                        onChange={(e) => setTemplateForm({ ...templateForm, isDefault: e.target.checked })}
                        className="rounded border-gray-300 text-omniwallet-primary focus:ring-omniwallet-primary"
                      />
                      <span className="text-sm text-gray-700">Plantilla por defecto</span>
                    </label>
                  </div>

                  {/* Variables reference */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Variables disponibles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {CONTRACT_VARIABLES.map(v => (
                        <span
                          key={v.var}
                          className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 cursor-help"
                          title={v.desc}
                        >
                          {v.var}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contenido del contrato (Espanol) *
                    </label>
                    <textarea
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary font-mono text-sm"
                      placeholder="CONTRATO DE COLABORACION&#10;&#10;Entre Omniwallet, S.L. y {companyName}..."
                    />
                  </div>

                  <details className="border border-gray-200 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Traducciones (opcional)
                    </summary>
                    <div className="p-4 space-y-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contenido (Ingles)
                        </label>
                        <textarea
                          value={templateForm.content_en}
                          onChange={(e) => setTemplateForm({ ...templateForm, content_en: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contenido (Italiano)
                        </label>
                        <textarea
                          value={templateForm.content_it}
                          onChange={(e) => setTemplateForm({ ...templateForm, content_it: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary focus:border-omniwallet-primary font-mono text-sm"
                        />
                      </div>
                    </div>
                  </details>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={resetTemplateForm}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      disabled={loading || !templateForm.name || !templateForm.content}
                      className="px-4 py-2 bg-omniwallet-primary text-white rounded-lg hover:bg-omniwallet-secondary transition disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : editingTemplate ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates list */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {templates.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay plantillas de contrato</p>
                <p className="text-sm text-gray-400">Crea tu primera plantilla para empezar</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contratos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{template.name}</span>
                          {template.isDefault && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">Por defecto</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.partnerCategory
                          ? PARTNER_CATEGORIES.find(c => c.value === template.partnerCategory)?.label
                          : 'Todas'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template._count.contracts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          template.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {template.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-2 text-gray-400 hover:text-omniwallet-primary transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filtrar:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-omniwallet-primary"
              >
                <option value="all">Todos</option>
                <option value="PENDING_SIGNATURE">Pendientes</option>
                <option value="SIGNED">Firmados</option>
                <option value="CANCELLED">Cancelados</option>
                <option value="EXPIRED">Expirados</option>
              </select>
            </div>

            {/* Assign contract button */}
            {templates.length > 0 && partnersWithoutContract.length > 0 && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-omniwallet-primary text-white rounded-lg hover:bg-omniwallet-secondary transition"
              >
                <Send className="w-4 h-4" />
                Asignar Contrato
              </button>
            )}
          </div>

          {/* Assign Contract Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Asignar Contrato</h2>
                  <button
                    onClick={() => { setShowAssignModal(false); setAssignPartnerId(''); setAssignTemplateId(''); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Partner *
                    </label>
                    <select
                      value={assignPartnerId}
                      onChange={(e) => setAssignPartnerId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary"
                    >
                      <option value="">Selecciona un partner</option>
                      {partnersWithoutContract.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.companyName} ({PARTNER_CATEGORIES.find(c => c.value === p.partnerCategory)?.label})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plantilla *
                    </label>
                    <select
                      value={assignTemplateId}
                      onChange={(e) => setAssignTemplateId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-omniwallet-primary"
                    >
                      <option value="">Selecciona una plantilla</option>
                      {templates.filter(t => t.isActive).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.isDefault && '(Por defecto)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => { setShowAssignModal(false); setAssignPartnerId(''); setAssignTemplateId(''); }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAssignContract}
                      disabled={loading || !assignPartnerId || !assignTemplateId}
                      className="px-4 py-2 bg-omniwallet-primary text-white rounded-lg hover:bg-omniwallet-secondary transition disabled:opacity-50"
                    >
                      {loading ? 'Asignando...' : 'Asignar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Contract Modal */}
          {viewingContract && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Contrato - {viewingContract.partner.companyName}</h2>
                    <p className="text-sm text-gray-500">{getStatusBadge(viewingContract.status)}</p>
                  </div>
                  <button onClick={() => setViewingContract(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  {viewingContract.status === 'SIGNED' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Datos de firma</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Firmante:</span>
                          <span className="ml-2 text-gray-900">{viewingContract.signatoryName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">DNI:</span>
                          <span className="ml-2 text-gray-900">{viewingContract.signatoryDni}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cargo:</span>
                          <span className="ml-2 text-gray-900">{viewingContract.signatoryPosition}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">CIF:</span>
                          <span className="ml-2 text-gray-900">{viewingContract.companyCif}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Direccion:</span>
                          <span className="ml-2 text-gray-900">{viewingContract.companyAddress}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Fecha de firma:</span>
                          <span className="ml-2 text-gray-900">
                            {viewingContract.signedAt && new Date(viewingContract.signedAt).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">IP:</span>
                          <span className="ml-2 text-gray-900">{viewingContract.signatureIp}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {viewingContract.content}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contracts list */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filteredContracts.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay contratos</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plantilla</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{contract.partner.companyName}</p>
                          <p className="text-sm text-gray-500">{contract.partner.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.template?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(contract.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.signedAt
                          ? new Date(contract.signedAt).toLocaleDateString('es-ES')
                          : new Date(contract.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingContract(contract)}
                            className="p-2 text-gray-400 hover:text-omniwallet-primary transition"
                            title="Ver contrato"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {contract.status === 'PENDING_SIGNATURE' && (
                            <button
                              onClick={() => handleCancelContract(contract.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition"
                              title="Cancelar"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
