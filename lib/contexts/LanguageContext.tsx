'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import esTranslations from '@/lib/locales/es.json'
import enTranslations from '@/lib/locales/en.json'
import itTranslations from '@/lib/locales/it.json'
import frTranslations from '@/lib/locales/fr.json'
import deTranslations from '@/lib/locales/de.json'
import ptTranslations from '@/lib/locales/pt.json'

export type Language = 'es' | 'en' | 'it' | 'fr' | 'de' | 'pt'

export const LANGUAGES: Language[] = ['es', 'en', 'it', 'fr', 'de', 'pt']

export const LANGUAGE_NAMES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
}

export const LANGUAGE_FLAGS: Record<Language, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇵🇹',
}

type Translations = typeof esTranslations

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  translations: Translations
  showLanguageModal: boolean
  setShowLanguageModal: (show: boolean) => void
  hasSelectedLanguage: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// All translations with fallback logic
const allTranslations: Record<Language, Record<string, unknown>> = {
  es: esTranslations,
  en: enTranslations,
  it: itTranslations,
  fr: frTranslations,
  de: deTranslations,
  pt: ptTranslations,
}

// Get translation with fallback
function getTranslationValue(
  translations: Record<string, unknown>,
  keys: string[],
  fallback: Record<string, unknown>
): unknown {
  let value: unknown = translations

  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k]
    } else {
      // Try fallback (English)
      let fallbackValue: unknown = fallback
      for (const fk of keys) {
        if (fallbackValue && typeof fallbackValue === 'object' && fk in (fallbackValue as Record<string, unknown>)) {
          fallbackValue = (fallbackValue as Record<string, unknown>)[fk]
        } else {
          return undefined
        }
      }
      return fallbackValue
    }
  }

  return value
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    const hasSelected = localStorage.getItem('hasSelectedLanguage')

    if (savedLanguage && LANGUAGES.includes(savedLanguage)) {
      setLanguageState(savedLanguage)
      setHasSelectedLanguage(true)
      // Sync cookie with localStorage
      document.cookie = `language=${savedLanguage};path=/;max-age=31536000;SameSite=Lax`
    } else if (!hasSelected) {
      // First time visitor - detect browser language
      const browserLang = navigator.language.split('-')[0] as Language
      if (LANGUAGES.includes(browserLang)) {
        setLanguageState(browserLang)
        document.cookie = `language=${browserLang};path=/;max-age=31536000;SameSite=Lax`
      }
      // Show language selection modal on first visit
      setHasSelectedLanguage(false)
      setShowLanguageModal(true)
    }
    setIsInitialized(true)
  }, [])

  // Save language to localStorage and cookie when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    localStorage.setItem('hasSelectedLanguage', 'true')
    // Also set cookie for server-side access
    document.cookie = `language=${lang};path=/;max-age=31536000;SameSite=Lax`
    setHasSelectedLanguage(true)
    setShowLanguageModal(false)
  }

  // Translation function with dot notation support and fallback
  const t = (key: string): string => {
    const keys = key.split('.')
    const currentTranslations = allTranslations[language]
    const fallbackTranslations = allTranslations['en']

    // Try current language
    let value = getTranslationValue(currentTranslations, keys, fallbackTranslations)

    // If not found or empty, try English fallback
    if (value === undefined || value === '') {
      value = getTranslationValue(fallbackTranslations, keys, esTranslations)
    }

    // If still not found, try Spanish
    if (value === undefined || value === '') {
      value = getTranslationValue(esTranslations as Record<string, unknown>, keys, esTranslations)
    }

    return typeof value === 'string' ? value : key
  }

  // Get current translations (with fallback for empty languages)
  const getCurrentTranslations = (): Translations => {
    const current = allTranslations[language]
    if (Object.keys(current).length === 0) {
      return enTranslations as Translations
    }
    return current as Translations
  }

  // Prevent hydration mismatch by waiting for client-side initialization
  if (!isInitialized) {
    return null
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations: getCurrentTranslations(),
        showLanguageModal,
        setShowLanguageModal,
        hasSelectedLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
