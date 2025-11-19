'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Loader2 } from 'lucide-react'
import Logo from '@/components/Logo'
import LanguageSelector from '@/components/LanguageSelector'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (result?.ok) {
        // Redirect based on role will be handled by middleware
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError(t.login.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo variant="dark" size="lg" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t.login.submit}</h1>
          <p className="text-sm text-gray-500">{t.login.subtitle}</p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <LanguageSelector />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.login.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.login.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
              placeholder="••••••••"
            />
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
                {t.common.loading}
              </>
            ) : (
              t.login.submit
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {t.login.noAccount}{' '}
            <Link
              href="/register"
              className="text-omniwallet-primary font-medium hover:text-omniwallet-secondary transition"
            >
              {t.login.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
