import { getPartnerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CreatePartnerLeadForm from '../components/CreatePartnerLeadForm'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'

export default async function NewPartnerLeadPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: {
      // Only fetch active affiliates
      affiliates: {
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          companyName: true,
          affiliateCommission: true,
        },
        orderBy: { companyName: 'asc' },
      },
    },
  })

  if (!partner) {
    return <div>Partner not found</div>
  }

  // Only show affiliates if partner can have affiliates
  const affiliates = partner.canHaveAffiliates ? partner.affiliates : []

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar canHaveAffiliates={partner.canHaveAffiliates} />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <Link
              href="/partner/leads"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-omniwallet-primary mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Leads
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Crear Nuevo Lead</h1>
            <p className="text-sm text-gray-500 mt-1">
              Agrega un nuevo contacto potencial a tu pipeline
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CreatePartnerLeadForm
              affiliates={affiliates}
              parentPartnerId={partner.id}
              parentCommission={partner.commissionRate}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
