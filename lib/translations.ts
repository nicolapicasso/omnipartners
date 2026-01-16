import en from './locales/en.json'
import es from './locales/es.json'
import it from './locales/it.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import pt from './locales/pt.json'

export type SupportedLocale = 'es' | 'en' | 'it' | 'fr' | 'de' | 'pt'

// Use Spanish as the base type since it's the source of truth
export type TranslationType = typeof es

export const SUPPORTED_LOCALES: SupportedLocale[] = ['es', 'en', 'it', 'fr', 'de', 'pt']

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  es: 'Español',
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
}

export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇵🇹',
}

const translations: Record<SupportedLocale, TranslationType | Record<string, unknown>> = {
  es,
  en,
  it,
  fr,
  de,
  pt,
}

export function getTranslations(locale: string = 'en'): TranslationType {
  const normalizedLocale = locale.toLowerCase().split('-')[0] as SupportedLocale

  // If locale is supported and has translations, use it
  if (SUPPORTED_LOCALES.includes(normalizedLocale)) {
    const localeTranslations = translations[normalizedLocale]
    // If translations exist (not empty), use them
    if (localeTranslations && Object.keys(localeTranslations).length > 0) {
      return localeTranslations as TranslationType
    }
  }

  // Fallback to English, then Spanish
  if (Object.keys(en).length > 0) {
    return en as TranslationType
  }
  return es
}

export function isLocaleSupported(locale: string): boolean {
  const normalizedLocale = locale.toLowerCase().split('-')[0] as SupportedLocale
  return SUPPORTED_LOCALES.includes(normalizedLocale)
}

export function getDefaultLocale(): SupportedLocale {
  return 'en'
}
