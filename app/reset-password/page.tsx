'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import { validateResetToken, resetPassword } from './actions'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setValidating(false)
        return
      }

      const result = await validateResetToken(token)
      setTokenValid(result.valid)
      setValidating(false)
    }

    checkToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    const result = await resetPassword(token!, password)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Error al restablecer la contraseña')
    }

    setLoading(false)
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-omniwallet-primary mb-4" />
            <p className="text-gray-600">Validando enlace...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo variant="dark" size="lg" />
            </div>
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Enlace no válido</h1>
            <p className="text-sm text-gray-500">
              El enlace de recuperación ha expirado o no es válido. Por favor solicita uno nuevo.
            </p>
          </div>

          <Link
            href="/forgot-password"
            className="w-full bg-omniwallet-primary text-white py-2.5 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition flex items-center justify-center gap-2"
          >
            Solicitar nuevo enlace
          </Link>

          <div className="mt-4 text-center">
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Contraseña actualizada</h1>
            <p className="text-sm text-gray-500">
              Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full bg-omniwallet-primary text-white py-2.5 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition flex items-center justify-center gap-2"
          >
            Iniciar sesión
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Nueva contraseña</h1>
          <p className="text-sm text-gray-500">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="••••••••"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="••••••••"
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
                Guardando...
              </>
            ) : (
              'Guardar nueva contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-omniwallet-primary mb-4" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
