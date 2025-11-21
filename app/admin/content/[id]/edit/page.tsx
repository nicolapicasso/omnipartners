import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContentForm from '../../components/ContentForm'

export default async function EditContentPage({
  params,
}: {
  params: { id: string }
}) {
  await getAdminSession()

  const content = await prisma.content.findUnique({
    where: { id: params.id },
  })

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Contenido no encontrado</h1>
          <Link
            href="/admin/content"
            className="text-omniwallet-primary hover:text-omniwallet-secondary"
          >
            ← Volver a Contenidos
          </Link>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold">Editar Recurso</h1>
          <p className="text-omniwallet-light mt-2">{content.title}</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <ContentForm content={content} />
          </div>
        </div>
      </main>
    </div>
  )
}
