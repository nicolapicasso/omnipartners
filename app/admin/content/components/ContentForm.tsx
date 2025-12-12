'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createContent, updateContent } from '../actions'
import { ContentType, ContentCategory, ContentStatus, Content } from '@/types'
import { FileText, Link as LinkIcon, Tag, Star, Image } from 'lucide-react'

interface FormData {
  title: string
  description: string
  type: ContentType
  category: ContentCategory
  fileUrl: string
  externalUrl: string
  coverImageUrl: string
  tags: string[]
  isFeatured: boolean
  order: number
  status: ContentStatus
}

export default function ContentForm({ content }: { content?: Content }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<FormData>({
    title: content?.title || '',
    description: content?.description || '',
    type: (content?.type as ContentType) || ContentType.DOCUMENT,
    category: (content?.category as ContentCategory) || ContentCategory.GENERAL,
    fileUrl: content?.fileUrl || '',
    externalUrl: content?.externalUrl || '',
    coverImageUrl: (content as any)?.coverImageUrl || '',
    tags: content?.tags ? JSON.parse(content.tags) : [],
    isFeatured: content?.isFeatured || false,
    order: content?.order || 0,
    status: (content?.status as ContentStatus) || ContentStatus.DRAFT,
  })

  const [tagInput, setTagInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.title || !formData.type || !formData.category) {
      setError('Por favor completa los campos obligatorios')
      setLoading(false)
      return
    }

    if (!formData.fileUrl && !formData.externalUrl) {
      setError('Debes proporcionar una URL de archivo o URL externa')
      setLoading(false)
      return
    }

    const result = content
      ? await updateContent(content.id, {
          ...formData,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        })
      : await createContent({
          ...formData,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        })

    if (result.success) {
      router.push('/admin/content')
    } else {
      setError(result.error || 'Error al guardar el contenido')
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          placeholder="Ej: Guía de Ventas para Omniwallet"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          placeholder="Describe el contenido..."
        />
      </div>

      {/* Tipo y Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Contenido *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            required
          >
            <option value={ContentType.DOCUMENT}>Documento</option>
            <option value={ContentType.VIDEO}>Video</option>
            <option value={ContentType.GUIDE}>Guía</option>
            <option value={ContentType.CONTRACT}>Contrato</option>
            <option value={ContentType.CERTIFICATION}>Certificación</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as ContentCategory })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            required
          >
            <option value={ContentCategory.COMMERCIAL}>Comercial</option>
            <option value={ContentCategory.TECHNICAL}>Técnico</option>
            <option value={ContentCategory.STRATEGIC}>Estratégico</option>
            <option value={ContentCategory.LEGAL}>Legal</option>
            <option value={ContentCategory.GENERAL}>General</option>
          </select>
        </div>
      </div>

      {/* URLs */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700">Archivos y URLs</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            URL del Archivo
          </label>
          <input
            type="url"
            value={formData.fileUrl}
            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="https://ejemplo.com/documento.pdf"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL del archivo subido (PDF, DOCX, etc.)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <LinkIcon className="w-4 h-4 inline mr-1" />
            URL Externa
          </label>
          <input
            type="url"
            value={formData.externalUrl}
            onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="https://youtube.com/watch?v=..."
          />
          <p className="text-xs text-gray-500 mt-1">
            URL externa (YouTube, Vimeo, Google Drive, etc.)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image className="w-4 h-4 inline mr-1" />
            Imagen de Portada
          </label>
          <input
            type="url"
            value={formData.coverImageUrl}
            onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL de la imagen de portada (se mostrará en la biblioteca de recursos)
          </p>
          {formData.coverImageUrl && (
            <div className="mt-2">
              <img
                src={formData.coverImageUrl}
                alt="Preview"
                className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="w-4 h-4 inline mr-1" />
          Etiquetas
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            placeholder="Agregar etiqueta..."
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="bg-omniwallet-primary text-white px-4 py-2 rounded-lg hover:bg-omniwallet-secondary transition"
          >
            Agregar
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Configuración */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700">Configuración</h3>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-4 h-4 text-omniwallet-primary border-gray-300 rounded focus:ring-omniwallet-primary"
          />
          <label htmlFor="isFeatured" className="text-sm text-gray-700 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            Destacar en dashboard de partners
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Orden de visualización
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Menor número aparece primero
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as ContentStatus })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          >
            <option value={ContentStatus.DRAFT}>Borrador</option>
            <option value={ContentStatus.PUBLISHED}>Publicado</option>
          </select>
          {formData.status === ContentStatus.PUBLISHED && (
            <p className="text-xs text-omniwallet-primary mt-1">
              Al publicar, se notificará a todos los partners activos
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
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
          {loading ? 'Guardando...' : content ? 'Actualizar Recurso' : 'Crear Recurso'}
        </button>
      </div>
    </form>
  )
}
