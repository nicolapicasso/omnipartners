'use server'

import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

// ============================================
// CERTIFICATION CONTENT ACTIONS
// ============================================

export async function createCertificationContent(data: {
  title: string
  content: string
  description?: string
  type: string
  url?: string
  order: number
  isPublished: boolean
}) {
  try {
    await getAdminSession()

    await prisma.certificationContent.create({
      data: {
        title: data.title,
        content: data.content,
        description: data.description || null,
        type: data.type,
        url: data.url || null,
        order: data.order,
        isPublished: data.isPublished,
      },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/partner/certification')
    return { success: true }
  } catch (error) {
    console.error('Error creating certification content:', error)
    return { success: false, error: 'Failed to create content' }
  }
}

export async function updateCertificationContent(
  id: string,
  data: {
    title: string
    content: string
    description?: string
    type: string
    url?: string
    order: number
    isPublished: boolean
  }
) {
  try {
    await getAdminSession()

    await prisma.certificationContent.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        description: data.description || null,
        type: data.type,
        url: data.url || null,
        order: data.order,
        isPublished: data.isPublished,
      },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/partner/certification')
    return { success: true }
  } catch (error) {
    console.error('Error updating certification content:', error)
    return { success: false, error: 'Failed to update content' }
  }
}

export async function deleteCertificationContent(id: string) {
  try {
    await getAdminSession()

    await prisma.certificationContent.delete({
      where: { id },
    })

    revalidatePath('/admin/certification')
    revalidatePath('/partner/certification')
    return { success: true }
  } catch (error) {
    console.error('Error deleting certification content:', error)
    return { success: false, error: 'Failed to delete content' }
  }
}

// ============================================
// CERTIFICATION QUESTION ACTIONS
// ============================================

export async function createCertificationQuestion(data: {
  question: string
  options: string[] // Array of options
  correctAnswer: number
  explanation?: string
  order: number
  isActive: boolean
}) {
  try {
    await getAdminSession()

    await prisma.certificationQuestion.create({
      data: {
        question: data.question,
        options: JSON.stringify(data.options),
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || null,
        order: data.order,
        isActive: data.isActive,
      },
    })

    revalidatePath('/admin/certification')
    return { success: true }
  } catch (error) {
    console.error('Error creating certification question:', error)
    return { success: false, error: 'Failed to create question' }
  }
}

export async function updateCertificationQuestion(
  id: string,
  data: {
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
    order: number
    isActive: boolean
  }
) {
  try {
    await getAdminSession()

    await prisma.certificationQuestion.update({
      where: { id },
      data: {
        question: data.question,
        options: JSON.stringify(data.options),
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || null,
        order: data.order,
        isActive: data.isActive,
      },
    })

    revalidatePath('/admin/certification')
    return { success: true }
  } catch (error) {
    console.error('Error updating certification question:', error)
    return { success: false, error: 'Failed to update question' }
  }
}

export async function deleteCertificationQuestion(id: string) {
  try {
    await getAdminSession()

    await prisma.certificationQuestion.delete({
      where: { id },
    })

    revalidatePath('/admin/certification')
    return { success: true }
  } catch (error) {
    console.error('Error deleting certification question:', error)
    return { success: false, error: 'Failed to delete question' }
  }
}
