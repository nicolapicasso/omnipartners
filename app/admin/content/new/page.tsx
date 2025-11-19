import { getAdminSession } from '@/lib/session'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContentForm from '../components/ContentForm'

export default async function NewContentPage() {
  await getAdminSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-omniwallet-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 text-white hover:text-omniwallet-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Contenidos
          </Link>
          <h1 className="text-3xl font-bold">Crear Nuevo Recurso</h1>
          <p className="text-omniwallet-light mt-2">
            Agrega contenido educativo para los partners
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <ContentForm />
          </div>
        </div>
      </main>
    </div>
  )
}
