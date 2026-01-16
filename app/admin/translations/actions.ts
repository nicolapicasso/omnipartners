'use server'

import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'
import {
  translateJsonFile,
  getOpenAIApiKey,
  setOpenAIApiKey,
  isOpenAIConfigured,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from '@/lib/openai-translation'

// Get OpenAI configuration status
export async function getOpenAIStatus() {
  await getAdminSession()
  const isConfigured = await isOpenAIConfigured()
  return { isConfigured }
}

// Save OpenAI API key
export async function saveOpenAIApiKey(apiKey: string) {
  await getAdminSession()

  if (!apiKey || apiKey.trim() === '') {
    return { success: false, error: 'API key is required' }
  }

  const success = await setOpenAIApiKey(apiKey.trim())
  if (success) {
    revalidatePath('/admin/translations')
    return { success: true }
  }
  return { success: false, error: 'Failed to save API key' }
}

// Get translation file content
async function getTranslationFile(locale: SupportedLanguage): Promise<Record<string, unknown>> {
  const filePath = path.join(process.cwd(), 'lib', 'locales', `${locale}.json`)
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

// Save translation file
async function saveTranslationFile(locale: SupportedLanguage, content: Record<string, unknown>) {
  const filePath = path.join(process.cwd(), 'lib', 'locales', `${locale}.json`)
  await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8')
}

// Get translation stats for all languages
export async function getTranslationStats() {
  await getAdminSession()

  const sourceFile = await getTranslationFile('es')
  const sourceKeys = flattenObject(sourceFile)
  const totalKeys = Object.keys(sourceKeys).length

  const stats: Record<string, { total: number; translated: number; percentage: number }> = {}

  for (const locale of SUPPORTED_LANGUAGES) {
    if (locale === 'es') {
      stats[locale] = { total: totalKeys, translated: totalKeys, percentage: 100 }
      continue
    }

    const localeFile = await getTranslationFile(locale)
    const localeKeys = flattenObject(localeFile)
    const translatedCount = Object.keys(localeKeys).filter(
      (key) => localeKeys[key] && localeKeys[key].trim() !== ''
    ).length

    stats[locale] = {
      total: totalKeys,
      translated: translatedCount,
      percentage: totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0,
    }
  }

  return stats
}

// Translate a specific language
export async function translateLanguage(targetLocale: SupportedLanguage) {
  await getAdminSession()

  if (targetLocale === 'es') {
    return { success: false, error: 'Cannot translate source language (Spanish)' }
  }

  const isConfigured = await isOpenAIConfigured()
  if (!isConfigured) {
    return { success: false, error: 'OpenAI API key not configured' }
  }

  try {
    const sourceFile = await getTranslationFile('es')
    const existingTranslations = await getTranslationFile(targetLocale)

    const result = await translateJsonFile(sourceFile, targetLocale, existingTranslations)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    await saveTranslationFile(targetLocale, result.translations as Record<string, unknown>)
    revalidatePath('/admin/translations')

    return {
      success: true,
      stats: result.stats,
    }
  } catch (error) {
    console.error('Translation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get all translations for a specific language
export async function getTranslations(locale: SupportedLanguage) {
  await getAdminSession()

  const sourceFile = await getTranslationFile('es')
  const targetFile = await getTranslationFile(locale)

  const sourceKeys = flattenObject(sourceFile)
  const targetKeys = flattenObject(targetFile)

  const translations: Array<{
    key: string
    source: string
    translation: string
    isTranslated: boolean
  }> = []

  for (const [key, value] of Object.entries(sourceKeys)) {
    translations.push({
      key,
      source: value,
      translation: targetKeys[key] || '',
      isTranslated: !!targetKeys[key] && targetKeys[key].trim() !== '',
    })
  }

  return translations
}

// Update a single translation
export async function updateTranslation(
  locale: SupportedLanguage,
  key: string,
  value: string
) {
  await getAdminSession()

  try {
    const file = await getTranslationFile(locale)
    const flattened = flattenObject(file)
    flattened[key] = value
    const unflattened = unflattenObject(flattened)

    await saveTranslationFile(locale, unflattened)
    revalidatePath('/admin/translations')

    return { success: true }
  } catch (error) {
    console.error('Update translation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper: Flatten nested object
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
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

// Helper: Unflatten object
function unflattenObject(obj: Record<string, string>): Record<string, unknown> {
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

// Translate certification questions
export async function translateCertificationQuestions(targetLocale: SupportedLanguage) {
  await getAdminSession()

  if (targetLocale === 'es') {
    return { success: false, error: 'Cannot translate source language (Spanish)' }
  }

  const isConfigured = await isOpenAIConfigured()
  if (!isConfigured) {
    return { success: false, error: 'OpenAI API key not configured' }
  }

  try {
    // Get all questions
    const questions = await prisma.certificationQuestion.findMany({
      orderBy: { order: 'asc' },
    })

    const { translateText } = await import('@/lib/openai-translation')
    let translatedCount = 0

    for (const question of questions) {
      const fieldSuffix = `_${targetLocale}`
      const questionField = `question${fieldSuffix}` as keyof typeof question
      const optionsField = `options${fieldSuffix}` as keyof typeof question
      const explanationField = `explanation${fieldSuffix}` as keyof typeof question

      // Skip if already translated
      if (question[questionField]) {
        continue
      }

      // Translate question
      const questionResult = await translateText(question.question, targetLocale)
      if (!questionResult.success) {
        console.error(`Failed to translate question ${question.id}:`, questionResult.error)
        continue
      }

      // Translate options (JSON array)
      const options = JSON.parse(question.options)
      const translatedOptions: string[] = []
      for (const option of options) {
        const optionResult = await translateText(option, targetLocale)
        if (optionResult.success && optionResult.translation) {
          translatedOptions.push(optionResult.translation)
        } else {
          translatedOptions.push(option) // Keep original if translation fails
        }
      }

      // Translate explanation if exists
      let translatedExplanation: string | null = null
      if (question.explanation) {
        const explanationResult = await translateText(question.explanation, targetLocale)
        if (explanationResult.success) {
          translatedExplanation = explanationResult.translation || null
        }
      }

      // Update the question with translations
      await prisma.certificationQuestion.update({
        where: { id: question.id },
        data: {
          [questionField]: questionResult.translation,
          [optionsField]: JSON.stringify(translatedOptions),
          [explanationField]: translatedExplanation,
        },
      })

      translatedCount++
    }

    revalidatePath('/admin/translations')
    revalidatePath('/admin/certification')

    return {
      success: true,
      message: `Translated ${translatedCount} questions to ${targetLocale}`,
    }
  } catch (error) {
    console.error('Certification translation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Translate certification content
export async function translateCertificationContent(targetLocale: SupportedLanguage) {
  await getAdminSession()

  if (targetLocale === 'es') {
    return { success: false, error: 'Cannot translate source language (Spanish)' }
  }

  const isConfigured = await isOpenAIConfigured()
  if (!isConfigured) {
    return { success: false, error: 'OpenAI API key not configured' }
  }

  try {
    const contents = await prisma.certificationContent.findMany({
      orderBy: { order: 'asc' },
    })

    const { translateText } = await import('@/lib/openai-translation')
    let translatedCount = 0

    for (const content of contents) {
      const fieldSuffix = `_${targetLocale}`
      const titleField = `title${fieldSuffix}` as keyof typeof content
      const contentField = `content${fieldSuffix}` as keyof typeof content
      const descriptionField = `description${fieldSuffix}` as keyof typeof content

      // Skip if already translated
      if (content[titleField]) {
        continue
      }

      // Translate title
      const titleResult = await translateText(content.title, targetLocale)
      if (!titleResult.success) {
        console.error(`Failed to translate content ${content.id}:`, titleResult.error)
        continue
      }

      // Translate content text
      const contentResult = await translateText(content.content, targetLocale)

      // Translate description if exists
      let translatedDescription: string | null = null
      if (content.description) {
        const descResult = await translateText(content.description, targetLocale)
        if (descResult.success) {
          translatedDescription = descResult.translation || null
        }
      }

      // Update with translations
      await prisma.certificationContent.update({
        where: { id: content.id },
        data: {
          [titleField]: titleResult.translation,
          [contentField]: contentResult.translation || content.content,
          [descriptionField]: translatedDescription,
        },
      })

      translatedCount++
    }

    revalidatePath('/admin/translations')
    revalidatePath('/admin/certification')

    return {
      success: true,
      message: `Translated ${translatedCount} content items to ${targetLocale}`,
    }
  } catch (error) {
    console.error('Certification content translation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Export translations as JSON string
export async function exportTranslations(locale: SupportedLanguage) {
  await getAdminSession()

  try {
    const file = await getTranslationFile(locale)
    const content = JSON.stringify(file, null, 2)
    return { success: true, content }
  } catch (error) {
    console.error('Export translations error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
