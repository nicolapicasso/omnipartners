'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Languages } from 'lucide-react'

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="relative">
      <button
        onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
        className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg font-medium transition"
        title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      >
        <Languages className="w-4 h-4" />
        <span className="uppercase">{locale}</span>
      </button>
    </div>
  )
}
