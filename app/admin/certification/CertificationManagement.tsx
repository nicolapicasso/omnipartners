'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import {
  createCertificationContent,
  updateCertificationContent,
  deleteCertificationContent,
  createCertificationQuestion,
  updateCertificationQuestion,
  deleteCertificationQuestion,
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

export default function CertificationManagement({
  contents,
  questions,
}: {
  contents: ContentItem[]
  questions: QuestionItem[]
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'content' | 'questions'>('content')

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('admin.manageCertification')}</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-6 py-3 font-medium text-sm transition ${
            activeTab === 'content'
              ? 'border-b-2 border-omniwallet-primary text-omniwallet-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('certification.studyMaterials')}
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-3 font-medium text-sm transition ${
            activeTab === 'questions'
              ? 'border-b-2 border-omniwallet-primary text-omniwallet-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('certification.adminQuestions.title')}
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && <ContentManagement contents={contents} />}

      {/* Questions Tab */}
      {activeTab === 'questions' && <QuestionManagement questions={questions} />}
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
