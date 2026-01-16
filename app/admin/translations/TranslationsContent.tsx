'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Settings,
  Globe,
  Languages,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Save,
  BookOpen,
  HelpCircle,
  Download,
  Upload,
} from 'lucide-react'
import {
  saveOpenAIApiKey,
  translateLanguage,
  getTranslations,
  updateTranslation,
  translateCertificationQuestions,
  translateCertificationContent,
  exportTranslations,
  importTranslations,
  getCertificationTranslationStats,
} from './actions'

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸', isSource: true },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
]

interface TranslationStats {
  [key: string]: {
    total: number
    translated: number
    percentage: number
  }
}

interface TranslationEntry {
  key: string
  source: string
  translation: string
  isTranslated: boolean
}

interface CertificationStats {
  [key: string]: {
    questions: { total: number; translated: number }
    content: { total: number; translated: number }
  }
}

export default function TranslationsContent({
  isOpenAIConfigured,
  initialStats,
}: {
  isOpenAIConfigured: boolean
  initialStats: TranslationStats
}) {
  const [apiKeyConfigured, setApiKeyConfigured] = useState(isOpenAIConfigured)
  const [apiKey, setApiKey] = useState('')
  const [savingApiKey, setSavingApiKey] = useState(false)
  const [stats, setStats] = useState(initialStats)

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [translations, setTranslations] = useState<TranslationEntry[]>([])
  const [loadingTranslations, setLoadingTranslations] = useState(false)
  const [translating, setTranslating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [savingTranslation, setSavingTranslation] = useState(false)
  const [translatingCert, setTranslatingCert] = useState<string | null>(null)
  const [certStats, setCertStats] = useState<CertificationStats>({})
  const [importing, setImporting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load certification stats on mount
  useEffect(() => {
    getCertificationTranslationStats().then(setCertStats)
  }, [])

  const handleSaveApiKey = async () => {
    setSavingApiKey(true)
    const result = await saveOpenAIApiKey(apiKey)
    if (result.success) {
      setApiKeyConfigured(true)
      setApiKey('')
    } else {
      alert(result.error)
    }
    setSavingApiKey(false)
  }

  const handleTranslateLanguage = async (locale: string) => {
    setTranslating(locale)
    const result = await translateLanguage(locale as 'en' | 'it' | 'fr' | 'de' | 'pt')
    if (result.success) {
      // Refresh stats
      const newStats = { ...stats }
      if (result.stats) {
        newStats[locale] = {
          total: result.stats.total,
          translated: result.stats.translated + (stats[locale]?.translated || 0),
          percentage: Math.round(
            ((result.stats.translated + (stats[locale]?.translated || 0)) / result.stats.total) * 100
          ),
        }
      }
      setStats(newStats)
      alert(`Traducción completada: ${result.stats?.translated || 0} claves traducidas`)
    } else {
      alert(`Error: ${result.error}`)
    }
    setTranslating(null)
  }

  const handleViewTranslations = async (locale: string) => {
    setSelectedLanguage(locale)
    setLoadingTranslations(true)
    const result = await getTranslations(locale as 'es' | 'en' | 'it' | 'fr' | 'de' | 'pt')
    setTranslations(result)
    setLoadingTranslations(false)
  }

  const handleEditTranslation = (key: string, currentValue: string) => {
    setEditingKey(key)
    setEditValue(currentValue)
  }

  const handleSaveTranslation = async () => {
    if (!selectedLanguage || !editingKey) return

    setSavingTranslation(true)
    const result = await updateTranslation(
      selectedLanguage as 'es' | 'en' | 'it' | 'fr' | 'de' | 'pt',
      editingKey,
      editValue
    )

    if (result.success) {
      setTranslations(
        translations.map((t) =>
          t.key === editingKey
            ? { ...t, translation: editValue, isTranslated: editValue.trim() !== '' }
            : t
        )
      )
      setEditingKey(null)
    } else {
      alert(`Error: ${result.error}`)
    }
    setSavingTranslation(false)
  }

  const handleTranslateCertification = async (locale: string, type: 'questions' | 'content') => {
    setTranslatingCert(`${locale}-${type}`)
    const result =
      type === 'questions'
        ? await translateCertificationQuestions(locale as 'en' | 'it' | 'fr' | 'de' | 'pt')
        : await translateCertificationContent(locale as 'en' | 'it' | 'fr' | 'de' | 'pt')

    if (result.success) {
      alert(result.message || 'Traducción completada')
    } else {
      alert(`Error: ${result.error}`)
    }
    setTranslatingCert(null)
  }

  const handleExportTranslations = async (locale: string) => {
    const result = await exportTranslations(locale as 'es' | 'en' | 'it' | 'fr' | 'de' | 'pt')
    if (result.success && result.content) {
      // Create and download the file
      const blob = new Blob([result.content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${locale}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleImportTranslations = async (locale: string, file: File) => {
    setImporting(locale)
    try {
      const content = await file.text()
      const result = await importTranslations(locale as 'en' | 'it' | 'fr' | 'de' | 'pt', content)
      if (result.success) {
        alert('Traducciones importadas correctamente')
        // Refresh if viewing this language
        if (selectedLanguage === locale) {
          handleViewTranslations(locale)
        }
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch {
      alert('Error al leer el archivo')
    }
    setImporting(null)
  }

  const filteredTranslations = translations.filter(
    (t) =>
      t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.translation.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* OpenAI Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Configuración de OpenAI</h2>
            <p className="text-sm text-gray-500">
              Configura la API de OpenAI para traducciones automáticas
            </p>
          </div>
          {apiKeyConfigured ? (
            <span className="ml-auto flex items-center gap-1 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Configurado
            </span>
          ) : (
            <span className="ml-auto flex items-center gap-1 text-amber-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              No configurado
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
          />
          <button
            onClick={handleSaveApiKey}
            disabled={savingApiKey || !apiKey}
            className="bg-omniwallet-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50 flex items-center gap-2"
          >
            {savingApiKey ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar
          </button>
        </div>
      </div>

      {/* Language Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Idiomas del Portal</h2>
            <p className="text-sm text-gray-500">Estado de las traducciones por idioma</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => {
            const langStats = stats[lang.code] || { total: 0, translated: 0, percentage: 0 }

            return (
              <div
                key={lang.code}
                className="border border-gray-200 rounded-lg p-4 hover:border-omniwallet-primary transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <p className="font-medium text-gray-900">{lang.name}</p>
                      <p className="text-xs text-gray-500">
                        {langStats.translated}/{langStats.total} claves
                      </p>
                    </div>
                  </div>
                  {lang.isSource && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Origen
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      langStats.percentage === 100
                        ? 'bg-green-500'
                        : langStats.percentage > 50
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${langStats.percentage}%` }}
                  />
                </div>

                <div className="flex gap-2">
                  {!lang.isSource && (
                    <button
                      onClick={() => handleTranslateLanguage(lang.code)}
                      disabled={!apiKeyConfigured || translating === lang.code}
                      className="flex-1 bg-omniwallet-primary/10 text-omniwallet-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-omniwallet-primary/20 transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {translating === lang.code ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Languages className="w-3 h-3" />
                      )}
                      Traducir
                    </button>
                  )}
                  <button
                    onClick={() => handleViewTranslations(lang.code)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition flex items-center justify-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleExportTranslations(lang.code)}
                    className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-200 transition flex items-center justify-center gap-1"
                    title="Exportar JSON"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  {!lang.isSource && (
                    <label
                      className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-200 transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Importar JSON"
                    >
                      {importing === lang.code ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImportTranslations(lang.code, file)
                            e.target.value = ''
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Certification Translations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Certificación</h2>
            <p className="text-sm text-gray-500">
              Traduce preguntas y contenido de certificación
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LANGUAGES.filter((l) => !l.isSource).map((lang) => {
            const langCertStats = certStats[lang.code]
            return (
            <div key={lang.code} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium text-gray-900">{lang.name}</span>
              </div>

              {/* Translation status indicators */}
              {langCertStats && (
                <div className="mb-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Preguntas:</span>
                    <span className={langCertStats.questions.translated === langCertStats.questions.total ? 'text-green-600' : 'text-amber-600'}>
                      {langCertStats.questions.translated}/{langCertStats.questions.total}
                      {langCertStats.questions.translated === langCertStats.questions.total ? ' ✓' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Contenido:</span>
                    <span className={langCertStats.content.translated === langCertStats.content.total ? 'text-green-600' : 'text-amber-600'}>
                      {langCertStats.content.translated}/{langCertStats.content.total}
                      {langCertStats.content.translated === langCertStats.content.total ? ' ✓' : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleTranslateCertification(lang.code, 'questions')}
                  disabled={!apiKeyConfigured || translatingCert === `${lang.code}-questions`}
                  className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-purple-200 transition disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {translatingCert === `${lang.code}-questions` ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <HelpCircle className="w-3 h-3" />
                  )}
                  Preguntas
                </button>
                <button
                  onClick={() => handleTranslateCertification(lang.code, 'content')}
                  disabled={!apiKeyConfigured || translatingCert === `${lang.code}-content`}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-200 transition disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {translatingCert === `${lang.code}-content` ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <BookOpen className="w-3 h-3" />
                  )}
                  Contenido
                </button>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* Translation Editor */}
      {selectedLanguage && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {LANGUAGES.find((l) => l.code === selectedLanguage)?.flag}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Traducciones - {LANGUAGES.find((l) => l.code === selectedLanguage)?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredTranslations.length} de {translations.length} claves
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedLanguage(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por clave o texto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              />
            </div>
          </div>

          {loadingTranslations ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-omniwallet-primary" />
              <p className="text-gray-500 mt-2">Cargando traducciones...</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Clave
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Español (Origen)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Traducción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTranslations.map((t) => (
                    <tr key={t.key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{t.key}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{t.source}</td>
                      <td className="px-4 py-3">
                        {editingKey === t.key ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-omniwallet-primary"
                            />
                            <button
                              onClick={handleSaveTranslation}
                              disabled={savingTranslation}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              {savingTranslation ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'OK'
                              )}
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditTranslation(t.key, t.translation)}
                            className="text-sm text-gray-900 hover:text-omniwallet-primary text-left w-full"
                          >
                            {t.translation || (
                              <span className="text-gray-400 italic">Sin traducción</span>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {t.isTranslated ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
