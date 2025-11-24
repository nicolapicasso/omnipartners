'use server'

import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function submitCertificationExam(answers: Array<{
  questionId: string
  answer: number
}>) {
  try {
    const session = await getPartnerSession()
    const partnerId = session.user.partnerId!

    // Fetch all questions to verify answers
    const questions = await prisma.certificationQuestion.findMany({
      where: {
        id: { in: answers.map(a => a.questionId) }
      }
    })

    // Create a map for quick lookup
    const questionMap = new Map(questions.map(q => [q.id, q]))

    // Verify each answer
    const verifiedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId)
      const correct = question ? question.correctAnswer === answer.answer : false

      return {
        questionId: answer.questionId,
        answer: answer.answer,
        correct
      }
    })

    const totalQuestions = verifiedAnswers.length
    const correctAnswers = verifiedAnswers.filter(a => a.correct).length
    const score = (correctAnswers / totalQuestions) * 100
    const passed = score >= 70 // 70% passing score

    // Create attempt record
    await prisma.certificationAttempt.create({
      data: {
        partnerId,
        totalQuestions,
        correctAnswers,
        score,
        passed,
        answers: JSON.stringify(verifiedAnswers),
      },
    })

    // If passed, update partner certification status
    if (passed) {
      await prisma.partner.update({
        where: { id: partnerId },
        data: {
          isCertified: true,
          certifiedAt: new Date(),
        },
      })
    }

    revalidatePath('/partner/certification')
    revalidatePath('/partner')

    return {
      success: true,
      passed,
      score,
      correctAnswers,
      totalQuestions
    }
  } catch (error) {
    console.error('Error submitting certification exam:', error)
    return { success: false, error: 'Failed to submit exam' }
  }
}
