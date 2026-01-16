import { cookies } from 'next/headers'
import Link from 'next/link'
import { getTranslations } from '@/lib/translations'

export default async function Home() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('language')?.value || 'es'
  const t = getTranslations(locale)

  return (
    <main className="min-h-screen bg-gradient-to-br from-omniwallet-primary via-omniwallet-secondary to-omniwallet-accent">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Omniwallet</h1>
          <p className="text-2xl mb-8">{t.common?.partnerPortal || 'Portal de Partners'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-white text-omniwallet-primary px-6 py-3 rounded-lg font-semibold hover:bg-omniwallet-light transition"
            >
              {t.auth?.login || 'Iniciar Sesión'}
            </Link>
            <Link
              href="/register"
              className="bg-omniwallet-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition"
            >
              {t.common?.registerAsPartner || 'Regístrate como Partner'}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
