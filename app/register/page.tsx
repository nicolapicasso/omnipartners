'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Loader2, CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import LanguageSelector from '@/components/LanguageSelector'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    contactName: '',
    phone: '',
    country: '',
    website: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t.login.error)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          contactName: formData.contactName,
          phone: formData.phone || undefined,
          country: formData.country,
          website: formData.website || undefined,
          address: formData.address || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t.login.error)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError(t.login.error)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo variant="dark" size="md" />
          </div>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t.register.success}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {t.register.pending}
          </p>
          <p className="text-xs text-gray-500">
            {t.common.loading}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-3xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo variant="dark" size="lg" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {t.register.title}
          </h1>
          <p className="text-sm text-gray-500">{t.register.subtitle}</p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <LanguageSelector />
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.register.companyName} *
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="Mi Empresa S.A."
              />
            </div>

            {/* Contact Name */}
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                {t.register.contactName} *
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                value={formData.contactName}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="Juan Pérez"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.login.email} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="contacto@miempresa.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t.register.phone}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="+34 600 000 000"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                {t.register.country} *
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="España"
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                {t.register.website}
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="https://www.miempresa.com"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                {t.register.address}
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="Calle Principal 123, Barcelona"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.login.password} *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t.login.password} *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-omniwallet-primary focus:border-omniwallet-primary transition"
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
                {t.common.loading}
              </>
            ) : (
              t.register.submit
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {t.register.hasAccount}{' '}
            <Link
              href="/login"
              className="text-omniwallet-primary font-medium hover:text-omniwallet-secondary transition"
            >
              {t.register.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
