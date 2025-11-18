import { getPartnerSession } from '@/lib/session'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CreatePartnerLeadForm from '../components/CreatePartnerLeadForm'

export default async function NewPartnerLeadPage() {
  await getPartnerSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-omniwallet-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/partner/leads"
            className="inline-flex items-center gap-2 text-white hover:text-omniwallet-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Leads
          </Link>
          <h1 className="text-3xl font-bold">Crear Nuevo Lead</h1>
          <p className="text-omniwallet-light mt-2">
            Añade un nuevo contacto potencial a tu cartera
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <CreatePartnerLeadForm />
          </div>
        </div>
      </main>
    </div>
  )
}
