import { prisma } from './prisma'

// Supported languages
export const SUPPORTED_LANGUAGES = ['es', 'en', 'it', 'fr', 'de', 'pt'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  es: 'Español',
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
}

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇵🇹',
}

// Get OpenAI API key from database
export async function getOpenAIApiKey(): Promise<string | null> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'openai_api_key' },
    })
    return setting?.value || null
  } catch (error) {
    console.error('Error getting OpenAI API key:', error)
    return null
  }
}

// Set OpenAI API key in database
export async function setOpenAIApiKey(apiKey: string): Promise<boolean> {
  try {
    await prisma.systemSettings.upsert({
      where: { key: 'openai_api_key' },
      update: { value: apiKey, updatedAt: new Date() },
      create: {
        key: 'openai_api_key',
        value: apiKey,
        description: 'OpenAI API key for automatic translations',
        isEncrypted: true,
      },
    })
    return true
  } catch (error) {
    console.error('Error setting OpenAI API key:', error)
    return false
  }
}

// Check if OpenAI API key is configured
export async function isOpenAIConfigured(): Promise<boolean> {
  const apiKey = await getOpenAIApiKey()
  return !!apiKey && apiKey.length > 0
}

interface TranslationResult {
  success: boolean
  translations?: Record<string, string>
  error?: string
}

// Translate a single text
export async function translateText(
  text: string,
  targetLanguage: SupportedLanguage,
  sourceLanguage: SupportedLanguage = 'es'
): Promise<{ success: boolean; translation?: string; error?: string }> {
  const apiKey = await getOpenAIApiKey()
  if (!apiKey) {
    return { success: false, error: 'OpenAI API key not configured' }
  }

  if (targetLanguage === sourceLanguage) {
    return { success: true, translation: text }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text from ${LANGUAGE_NAMES[sourceLanguage]} to ${LANGUAGE_NAMES[targetLanguage]}.
Only return the translated text, nothing else. Keep the same tone and format.
If the text contains placeholders like {variable} or {{variable}}, keep them exactly as they are.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error?.message || 'OpenAI API error' }
    }

    const data = await response.json()
    const translation = data.choices?.[0]?.message?.content?.trim()

    if (!translation) {
      return { success: false, error: 'No translation received' }
    }

    return { success: true, translation }
  } catch (error) {
    console.error('Translation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Translate multiple texts in batch
export async function translateBatch(
  texts: Record<string, string>,
  targetLanguage: SupportedLanguage,
  sourceLanguage: SupportedLanguage = 'es'
): Promise<TranslationResult> {
  const apiKey = await getOpenAIApiKey()
  if (!apiKey) {
    return { success: false, error: 'OpenAI API key not configured' }
  }

  if (targetLanguage === sourceLanguage) {
    return { success: true, translations: texts }
  }

  // Prepare texts for translation
  const entries = Object.entries(texts)
  if (entries.length === 0) {
    return { success: true, translations: {} }
  }

  try {
    // Create a structured prompt with all texts
    const textsToTranslate = entries.map(([key, value]) => `[${key}]: ${value}`).join('\n')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following texts from ${LANGUAGE_NAMES[sourceLanguage]} to ${LANGUAGE_NAMES[targetLanguage]}.
Each line has a key in brackets followed by the text to translate.
Return ONLY a valid JSON object with the same keys and translated values.
Keep the same tone and format. Keep placeholders like {variable} or {{variable}} exactly as they are.
Example input:
[greeting]: Hola, bienvenido
[farewell]: Adiós

Example output:
{"greeting": "Hello, welcome", "farewell": "Goodbye"}`,
          },
          {
            role: 'user',
            content: textsToTranslate,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error?.message || 'OpenAI API error' }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return { success: false, error: 'No translation received' }
    }

    // Parse JSON response
    try {
      const translations = JSON.parse(content)
      return { success: true, translations }
    } catch {
      console.error('Failed to parse translation response:', content)
      return { success: false, error: 'Failed to parse translation response' }
    }
  } catch (error) {
    console.error('Batch translation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Flatten nested object for translation
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey))
    } else if (typeof value === 'string') {
      result[newKey] = value
    }
  }

  return result
}

// Unflatten object from dot notation
export function unflattenObject(obj: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.')
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!(k in current)) {
        current[k] = {}
      }
      current = current[k] as Record<string, unknown>
    }

    current[keys[keys.length - 1]] = value
  }

  return result
}

// Translate entire JSON translation file
export async function translateJsonFile(
  sourceContent: Record<string, unknown>,
  targetLanguage: SupportedLanguage,
  existingTranslations?: Record<string, unknown>
): Promise<{ success: boolean; translations?: Record<string, unknown>; error?: string; stats?: { total: number; translated: number; skipped: number } }> {
  // Flatten source content
  const flatSource = flattenObject(sourceContent)
  const flatExisting = existingTranslations ? flattenObject(existingTranslations) : {}

  // Find keys that need translation (not in existing or empty)
  const keysToTranslate: Record<string, string> = {}
  for (const [key, value] of Object.entries(flatSource)) {
    if (!flatExisting[key] || flatExisting[key].trim() === '') {
      keysToTranslate[key] = value
    }
  }

  const stats = {
    total: Object.keys(flatSource).length,
    translated: 0,
    skipped: Object.keys(flatExisting).length,
  }

  if (Object.keys(keysToTranslate).length === 0) {
    // All translations exist, return existing
    return {
      success: true,
      translations: existingTranslations || sourceContent,
      stats
    }
  }

  // Translate in batches of 50 keys to avoid token limits
  const batchSize = 50
  const keys = Object.keys(keysToTranslate)
  const allTranslations: Record<string, string> = { ...flatExisting }

  for (let i = 0; i < keys.length; i += batchSize) {
    const batchKeys = keys.slice(i, i + batchSize)
    const batch: Record<string, string> = {}
    for (const key of batchKeys) {
      batch[key] = keysToTranslate[key]
    }

    const result = await translateBatch(batch, targetLanguage)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    Object.assign(allTranslations, result.translations)
    stats.translated += Object.keys(result.translations || {}).length
  }

  // Unflatten back to nested object
  const translations = unflattenObject(allTranslations)

  return { success: true, translations, stats }
}
