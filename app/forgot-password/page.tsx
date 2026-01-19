'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import { requestPasswordReset } from './actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email) {
      setError('Por favor ingresa tu email')
      setLoading(false)
      return
    }

    const result = await requestPasswordReset(email)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Error al procesar la solicitud')
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo variant="dark" size="lg" />
            </div>
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Email enviado</h1>
            <p className="text-sm text-gray-500">
              Si existe una cuenta con el email <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> El enlace expirará en 1 hora. Revisa también tu carpeta de spam.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full bg-omniwallet-primary text-white py-2.5 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo variant="dark" size="lg" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Recuperar contraseña</h1>
          <p className="text-sm text-gray-500">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-omniwallet-primary text-white py-2.5 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-omniwallet-primary font-medium hover:text-omniwallet-secondary transition text-sm flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
