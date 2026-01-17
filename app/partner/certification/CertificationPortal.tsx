'use client'

import { useState } from 'react'
import { Award, BookOpen, CheckCircle, XCircle, ExternalLink, FileText, Video, Link as LinkIcon, AlertTriangle, Lightbulb, Code, Copy, Check, Sun, Moon } from 'lucide-react'
import { submitCertificationExam, verifyAnswer } from './actions'
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

type AnswerResult = {
  answer: number
  correct: boolean
  explanation: string | null
  correctAnswer: number
}

export default function CertificationPortal({
  partnerId,
  isCertified,
  certifiedAt,
  expiresAt,
  contents,
  questions,
  attempts,
  badgeLightUrl,
  badgeDarkUrl,
  baseUrl,
}: {
  partnerId: string
  isCertified: boolean
  certifiedAt: Date | null
  expiresAt: Date | null
  contents: ContentItem[]
  questions: QuestionItem[]
  attempts: AttemptItem[]
  badgeLightUrl: string | null
  badgeDarkUrl: string | null
  baseUrl: string
}) {
  const { t } = useTranslation()
  const [view, setView] = useState<'overview' | 'content' | 'exam' | 'results'>('overview')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answerResults, setAnswerResults] = useState<{ [key: number]: AnswerResult }>({})
  const [examResults, setExamResults] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleStartExam = () => {
    setCurrentQuestion(0)
    setAnswerResults({})
    setExamResults(null)
    setView('exam')
  }

  const handleAnswerSelect = async (answerIndex: number) => {
    // Si ya hay una respuesta para esta pregunta, no hacer nada (bloqueado)
    if (answerResults[currentQuestion] !== undefined) {
      return
    }

    setVerifying(true)

    const question = questions[currentQuestion]
    const result = await verifyAnswer(question.id, answerIndex)

    if (result.success) {
      setAnswerResults({
        ...answerResults,
        [currentQuestion]: {
          answer: answerIndex,
          correct: result.correct!,
          explanation: result.explanation || null,
          correctAnswer: result.correctAnswer!
        }
      })
    }

    setVerifying(false)
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

  const getUnansweredQuestions = () => {
    const unanswered: number[] = []
    for (let i = 0; i < questions.length; i++) {
      if (answerResults[i] === undefined) {
        unanswered.push(i + 1) // +1 para mostrar números humanos (1-based)
      }
    }
    return unanswered
  }

  const handleFinishExam = () => {
    const unanswered = getUnansweredQuestions()
    if (unanswered.length > 0) {
      setShowConfirmModal(true)
    } else {
      submitExam()
    }
  }

  const submitExam = async () => {
    setShowConfirmModal(false)
    setSubmitting(true)

    // Preparar respuestas con IDs de pregunta
    const formattedAnswers = questions.map((q, index) => {
      const result = answerResults[index]
      return {
        questionId: q.id,
        answer: result?.answer ?? -1, // -1 para preguntas sin responder
      }
    }).filter(a => a.answer !== -1) // Solo enviar las respondidas

    const result = await submitCertificationExam(formattedAnswers)

    if (result.success) {
      setExamResults(result)
      setView('results')
    } else {
      alert(result.error)
    }

    setSubmitting(false)
  }

  const answeredCount = Object.keys(answerResults).length
  const currentResult = answerResults[currentQuestion]
  const isCurrentAnswered = currentResult !== undefined

  return (
    <div>
      {/* Modal de confirmación para finalizar con preguntas pendientes */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('certification.exam.unansweredTitle')}</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('certification.exam.unansweredCount').replace('{count}', String(getUnansweredQuestions().length))}
              <span className="font-semibold"> {getUnansweredQuestions().join(', ')}</span>
            </p>
            <p className="text-gray-600 mb-6">
              {t('certification.exam.unansweredWarning')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition"
              >
                {t('certification.exam.backToExam')}
              </button>
              <button
                onClick={submitExam}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition"
              >
                {t('certification.exam.finishWithout')}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <span className="font-semibold text-green-900">{t('certification.badgeLabel')}</span>
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

          {/* Embed Code Section - Only show if certified */}
          {isCertified && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-6 h-6 text-omniwallet-primary" />
                <h2 className="text-xl font-semibold text-gray-900">{t('certification.badge.title')}</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                {t('certification.badge.description')}
              </p>

              {/* Theme Selector */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-gray-700">{t('certification.badge.themeLabel')}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTheme('light')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                      selectedTheme === 'light'
                        ? 'bg-omniwallet-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    {t('certification.badge.light')}
                  </button>
                  <button
                    onClick={() => setSelectedTheme('dark')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                      selectedTheme === 'dark'
                        ? 'bg-omniwallet-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    {t('certification.badge.dark')}
                  </button>
                </div>
              </div>

              {/* Preview */}
              {(selectedTheme === 'light' ? badgeLightUrl : badgeDarkUrl) && (
                <div className={`p-4 rounded-lg mb-6 ${selectedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500 mb-2">{t('certification.badge.preview')}</p>
                  <img
                    src={selectedTheme === 'light' ? badgeLightUrl! : badgeDarkUrl!}
                    alt={t('certification.badge.altText')}
                    className="h-16 object-contain"
                  />
                </div>
              )}

              {/* Code Options */}
              <div className="space-y-4">
                {/* JavaScript Option */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">{t('certification.badge.option1Title')}</label>
                    <button
                      onClick={() => {
                        const code = `<script src="${baseUrl}/api/badge/${partnerId}?format=js&theme=${selectedTheme}"></script>`
                        navigator.clipboard.writeText(code)
                        setCopiedCode('js')
                        setTimeout(() => setCopiedCode(null), 2000)
                      }}
                      className="flex items-center gap-1 text-sm text-omniwallet-primary hover:text-omniwallet-secondary"
                    >
                      {copiedCode === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedCode === 'js' ? t('certification.badge.copied') : t('certification.badge.copy')}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`<script src="${baseUrl}/api/badge/${partnerId}?format=js&theme=${selectedTheme}"></script>`}</code>
                  </pre>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('certification.badge.option1Hint')}
                  </p>
                </div>

                {/* Iframe Option */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">{t('certification.badge.option2Title')}</label>
                    <button
                      onClick={() => {
                        const code = `<iframe src="${baseUrl}/badge/${partnerId}?theme=${selectedTheme}" width="200" height="80" frameborder="0" scrolling="no"></iframe>`
                        navigator.clipboard.writeText(code)
                        setCopiedCode('iframe')
                        setTimeout(() => setCopiedCode(null), 2000)
                      }}
                      className="flex items-center gap-1 text-sm text-omniwallet-primary hover:text-omniwallet-secondary"
                    >
                      {copiedCode === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedCode === 'iframe' ? t('certification.badge.copied') : t('certification.badge.copy')}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`<iframe src="${baseUrl}/badge/${partnerId}?theme=${selectedTheme}" width="200" height="80" frameborder="0" scrolling="no"></iframe>`}</code>
                  </pre>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('certification.badge.option2Hint')}
                  </p>
                </div>
              </div>

              {expiresAt && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    {t('certification.badge.expirationWarning').replace('{date}', new Date(expiresAt).toLocaleDateString())}
                  </p>
                </div>
              )}
            </div>
          )}

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
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-omniwallet-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Progress indicators */}
            <div className="flex gap-1 mb-6 flex-wrap">
              {questions.map((_, index) => {
                const result = answerResults[index]
                let bgColor = 'bg-gray-300'
                if (result) {
                  bgColor = result.correct ? 'bg-green-500' : 'bg-red-500'
                }
                const isActive = index === currentQuestion
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition ${bgColor} ${
                      isActive ? 'ring-2 ring-omniwallet-primary ring-offset-2' : ''
                    } ${result ? 'text-white' : 'text-gray-600'}`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {questions[currentQuestion].question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {JSON.parse(questions[currentQuestion].options).map((option: string, index: number) => {
                const isSelected = currentResult?.answer === index
                const isCorrectAnswer = currentResult?.correctAnswer === index
                const showAsCorrect = isCurrentAnswered && isCorrectAnswer
                const showAsIncorrect = isCurrentAnswered && isSelected && !currentResult?.correct

                let buttonClass = 'border-gray-200 hover:border-gray-300'
                if (showAsCorrect) {
                  buttonClass = 'border-green-500 bg-green-50'
                } else if (showAsIncorrect) {
                  buttonClass = 'border-red-500 bg-red-50'
                } else if (isSelected && !isCurrentAnswered) {
                  buttonClass = 'border-omniwallet-primary bg-omniwallet-primary/5'
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isCurrentAnswered || verifying}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${buttonClass} ${
                      isCurrentAnswered ? 'cursor-default' : ''
                    } ${verifying ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          showAsCorrect
                            ? 'border-green-500 bg-green-500'
                            : showAsIncorrect
                            ? 'border-red-500 bg-red-500'
                            : isSelected
                            ? 'border-omniwallet-primary bg-omniwallet-primary'
                            : 'border-gray-300'
                        }`}
                      >
                        {showAsCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                        {showAsIncorrect && <XCircle className="w-4 h-4 text-white" />}
                        {isSelected && !isCurrentAnswered && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        showAsCorrect
                          ? 'text-green-700'
                          : showAsIncorrect
                          ? 'text-red-700'
                          : isSelected
                          ? 'text-omniwallet-primary'
                          : 'text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Feedback después de responder */}
            {isCurrentAnswered && (
              <div className={`mt-6 p-4 rounded-lg ${
                currentResult.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {currentResult.correct ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-700">{t('certification.exam.correct')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-700">{t('certification.exam.incorrect')}</span>
                    </>
                  )}
                </div>
                {currentResult.explanation && (
                  <div className="flex items-start gap-2 mt-3">
                    <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-sm ${currentResult.correct ? 'text-green-700' : 'text-red-700'}`}>
                      {currentResult.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
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
              {answeredCount} / {questions.length} {t('certification.answered')}
            </div>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleFinishExam}
                disabled={submitting || verifying}
                className="px-6 py-3 bg-omniwallet-primary text-white rounded-md font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('common.submitting') : t('certification.finishExam')}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={verifying}
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
                <span className="font-semibold text-green-900">{t('certification.badgeLabel')}</span>
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
