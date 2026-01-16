'use client'

import { useTranslation, Language, LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@/lib/contexts/LanguageContext'
import { Globe } from 'lucide-react'

export default function LanguageSelector() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent cursor-pointer"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
          </option>
        ))}
      </select>
    </div>
  )
}
