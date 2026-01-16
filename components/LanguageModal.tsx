'use client'

import { useTranslation, LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS, Language } from '@/lib/contexts/LanguageContext'
import { Globe } from 'lucide-react'

export default function LanguageModal() {
  const { showLanguageModal, setLanguage, language } = useTranslation()

  if (!showLanguageModal) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-omniwallet-primary/10 p-3 rounded-full">
            <Globe className="w-6 h-6 text-omniwallet-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Select your language
            </h2>
            <p className="text-sm text-gray-500">
              Choose your preferred language
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition hover:border-omniwallet-primary hover:bg-omniwallet-primary/5 ${
                language === lang
                  ? 'border-omniwallet-primary bg-omniwallet-primary/5'
                  : 'border-gray-200'
              }`}
            >
              <span className="text-2xl">{LANGUAGE_FLAGS[lang]}</span>
              <span className="font-medium text-gray-900">
                {LANGUAGE_NAMES[lang]}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          You can change this anytime in the settings
        </p>
      </div>
    </div>
  )
}
