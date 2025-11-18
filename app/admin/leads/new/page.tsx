import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { PartnerStatus } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CreateLeadForm from '../components/CreateLeadForm'

export default async function NewLeadPage() {
  await getAdminSession()

  const activePartners = await prisma.partner.findMany({
    where: { status: PartnerStatus.ACTIVE },
    orderBy: { companyName: 'asc' },
    select: {
      id: true,
      companyName: true,
      email: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-omniwallet-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 text-white hover:text-omniwallet-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Leads
          </Link>
          <h1 className="text-3xl font-bold">Crear Nuevo Lead</h1>
          <p className="text-omniwallet-light mt-2">
            Asigna un nuevo lead a un partner activo
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            {activePartners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  No hay partners activos. Debes aprobar al menos un partner antes de crear
                  leads.
                </p>
                <Link
                  href="/admin/partners"
                  className="text-omniwallet-primary hover:text-omniwallet-secondary font-semibold"
                >
                  Ir a Partners →
                </Link>
              </div>
            ) : (
              <CreateLeadForm partners={activePartners} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
