import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditPartnerLeadForm from '../../components/EditPartnerLeadForm'

export default async function EditPartnerLeadPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
  })

  // Verify lead belongs to partner
  if (!lead || lead.partnerId !== partnerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Lead no encontrado</h1>
          <Link
            href="/partner/leads"
            className="text-omniwallet-primary hover:text-omniwallet-secondary"
          >
            ← Volver a Mis Leads
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
            href={`/partner/leads/${lead.id}`}
            className="inline-flex items-center gap-2 text-white hover:text-omniwallet-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Lead
          </Link>
          <h1 className="text-3xl font-bold">Editar Lead</h1>
          <p className="text-omniwallet-light mt-2">{lead.companyName}</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <EditPartnerLeadForm lead={lead} />
          </div>
        </div>
      </main>
    </div>
  )
}
