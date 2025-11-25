import en from './locales/en.json'
import es from './locales/es.json'

export function getTranslations(locale: string = 'en') {
  return locale === 'es' ? es : en
}
