'use client'

import { useState } from 'react'
import { Award, BookOpen, CheckCircle, XCircle, ExternalLink, FileText, Video, Link as LinkIcon } from 'lucide-react'
import { submitCertificationExam } from './actions'
import { useTranslation } from '@/lib/contexts/LanguageContext'

type ContentItem = {
  id: string
  title: string
  content: string
  description: string | null
  type: string
  url: string | null
  order: number
}

type QuestionItem = {
  id: string
  question: string
  options: string
  order: number
}

type AttemptItem = {
  id: string
  totalQuestions: number
  correctAnswers: number
  score: number
  passed: boolean
  completedAt: Date
}

export default function CertificationPortal({
  isCertified,
  certifiedAt,
  contents,
  questions,
  attempts,
}: {
  isCertified: boolean
  certifiedAt: Date | null
  contents: ContentItem[]
  questions: QuestionItem[]
  attempts: AttemptItem[]
}) {
  const { t } = useTranslation()
  const [view, setView] = useState<'overview' | 'content' | 'exam' | 'results'>('overview')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [examResults, setExamResults] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleStartExam = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setExamResults(null)
    setView('exam')
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answerIndex,
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitExam = async () => {
    // Check all questions answered
    if (Object.keys(answers).length < questions.length) {
      alert(t('certification.answerAllQuestions'))
      return
    }

    setSubmitting(true)

    // Prepare answers with question IDs
    const formattedAnswers = questions.map((q, index) => {
      const selectedAnswer = answers[index]

      return {
        questionId: q.id,
        answer: selectedAnswer,
      }
    })

    const result = await submitCertificationExam(formattedAnswers)

    if (result.success) {
      setExamResults(result)
      setView('results')
    } else {
      alert(result.error)
    }

    setSubmitting(false)
  }

  return (
    <div>
      {/* Overview */}
      {view === 'overview' && (
        <div>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">{t('certification.title')}</h1>
            <p className="text-gray-600 mt-1">{t('certification.getCertifiedDescription')}</p>
          </div>

          <div className="mb-8">

            {/* Certification Status */}
            {isCertified ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-green-900">{t('certification.youAreCertified')}</h2>
                </div>
                <p className="text-green-700">
                  {t('certification.certifiedSince')} {certifiedAt ? new Date(certifiedAt).toLocaleDateString() : 'N/A'}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-green-200">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">{t('certification.badge')}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-omniwallet-primary/10 to-omniwallet-secondary/10 border-2 border-omniwallet-primary/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-6 h-6 text-omniwallet-primary" />
                  <h2 className="text-xl font-bold text-omniwallet-secondary">{t('certification.getCertified')}</h2>
                </div>
                <p className="text-omniwallet-secondary mb-4">
                  {t('certification.getCertifiedDescription')}
                </p>
                <p className="text-sm text-omniwallet-primary">
                  {t('certification.studyDescription')}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setView('content')}
              className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-omniwallet-primary transition text-left"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-omniwallet-primary/10 rounded-lg">
                  <BookOpen className="w-6 h-6 text-omniwallet-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('certification.studyMaterials')}</h3>
                  <p className="text-sm text-gray-600">{contents.length} {t('certification.resourcesAvailable')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {t('certification.reviewContent')}
              </p>
            </button>

            <button
              onClick={handleStartExam}
              disabled={questions.length === 0}
              className="bg-gradient-to-br from-omniwallet-primary to-omniwallet-secondary text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {isCertified ? t('certification.retakeExam') : t('certification.takeExam')}
                  </h3>
                  <p className="text-sm text-white/90">{questions.length} {t('certification.questions')}</p>
                </div>
              </div>
              <p className="text-sm text-white/90">
                {t('certification.testKnowledge')}
              </p>
            </button>
          </div>

          {/* Previous Attempts */}
          {attempts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('certification.previousAttempts')}</h3>
              <div className="space-y-3">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {attempt.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(attempt.completedAt).toLocaleDateString()} at{' '}
                          {new Date(attempt.completedAt).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {attempt.correctAnswers} / {attempt.totalQuestions} {t('certification.answered')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.score.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">{attempt.passed ? t('certification.passed') : t('certification.failed')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Study Content View */}
      {view === 'content' && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => setView('overview')}
              className="text-omniwallet-primary hover:text-omniwallet-secondary font-medium text-sm mb-4"
            >
              ← {t('certification.backToOverview')}
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('certification.studyMaterials')}</h1>
            <p className="text-gray-600">{t('certification.reviewContent')}</p>
          </div>

          <div className="space-y-6">
            {contents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500">{t('certification.noStudyMaterials')}</p>
              </div>
            ) : (
              contents.map((content) => (
                <div key={content.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-omniwallet-primary/10 rounded-lg">
                      {content.type === 'VIDEO' && <Video className="w-6 h-6 text-omniwallet-primary" />}
                      {content.type === 'DOCUMENT' && <FileText className="w-6 h-6 text-omniwallet-primary" />}
                      {content.type === 'EXTERNAL_LINK' && <LinkIcon className="w-6 h-6 text-omniwallet-primary" />}
                      {content.type === 'TEXT' && <BookOpen className="w-6 h-6 text-omniwallet-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{content.title}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {content.type}
                        </span>
                      </div>
                      {content.description && (
                        <p className="text-sm text-gray-600 mb-3">{content.description}</p>
                      )}

                      {/* Content */}
                      <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                        {content.content.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-2">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {/* URL Link if available */}
                      {content.url && (
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-omniwallet-primary hover:text-omniwallet-secondary font-medium text-sm"
                        >
                          {t('certification.viewContent')}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleStartExam}
              disabled={questions.length === 0}
              className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-6 py-3 rounded-md font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50"
            >
              <Award className="w-5 h-5" />
              {isCertified ? t('certification.retakeExam') : t('certification.takeExam')}
            </button>
          </div>
        </div>
      )}

      {/* Exam View */}
      {view === 'exam' && questions.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-gray-900">{t('certification.examTitle')}</h1>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {t('certification.question')} {currentQuestion + 1} {t('certification.of')} {questions.length}
                </p>
                <p className="text-xs text-gray-500">{t('certification.passingScore')}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-omniwallet-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {questions[currentQuestion].question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {JSON.parse(questions[currentQuestion].options).map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    answers[currentQuestion] === index
                      ? 'border-omniwallet-primary bg-omniwallet-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion] === index
                          ? 'border-omniwallet-primary bg-omniwallet-primary'
                          : 'border-gray-300'
                      }`}
                    >
                      {answers[currentQuestion] === index && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      answers[currentQuestion] === index ? 'text-omniwallet-primary' : 'text-gray-700'
                    }`}>
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('certification.previous')}
            </button>

            <div className="text-sm text-gray-600">
              {Object.keys(answers).length} / {questions.length} {t('certification.answered')}
            </div>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="px-6 py-3 bg-omniwallet-primary text-white rounded-md font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('common.submitting') : t('certification.finishExam')}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentQuestion === questions.length - 1}
                className="px-6 py-3 bg-omniwallet-primary text-white rounded-md font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('certification.nextQuestion')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results View */}
      {view === 'results' && examResults && (
        <div>
          <div className="mb-8 text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              examResults.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {examResults.passed ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('certification.examResults')}</h1>
            <p className={`text-lg ${examResults.passed ? 'text-green-600' : 'text-red-600'}`}>
              {examResults.passed ? t('certification.passed') : t('certification.failed')}
            </p>
          </div>

          {/* Score Card */}
          <div className={`rounded-lg p-8 mb-8 text-center ${
            examResults.passed
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200'
          }`}>
            <div className="text-6xl font-bold mb-2" style={{ color: examResults.passed ? '#16a34a' : '#dc2626' }}>
              {examResults.score.toFixed(1)}%
            </div>
            <p className={`text-lg mb-4 ${examResults.passed ? 'text-green-700' : 'text-red-700'}`}>
              {examResults.correctAnswers} {t('certification.of')} {examResults.totalQuestions} {t('certification.answered')}
            </p>
            {examResults.passed ? (
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-green-200">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">{t('certification.badge')}</span>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                {t('certification.studyDescription')}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setView('overview')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition"
            >
              {t('certification.backToCertification')}
            </button>
            {!examResults.passed && (
              <button
                onClick={handleStartExam}
                className="px-6 py-3 bg-omniwallet-primary text-white rounded-md font-medium hover:bg-omniwallet-secondary transition"
              >
                {t('certification.tryAgain')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
