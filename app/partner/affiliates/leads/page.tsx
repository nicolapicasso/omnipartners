import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, TrendingUp, Users, Building2 } from 'lucide-react'
import { LeadStatus } from '@/types'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'

export default async function AffiliateLeadsPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: {
      affiliates: {
        where: { status: 'ACTIVE' },
        include: {
          leads: {
            include: {
              payments: {
                select: { id: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { companyName: 'asc' },
      },
    },
  })

  if (!partner) {
    return <div>Partner no encontrado</div>
  }

  // If partner cannot have affiliates, redirect to dashboard
  if (!partner.canHaveAffiliates) {
    redirect('/partner')
  }

  // Flatten all leads from all affiliates with affiliate info
  const allAffiliateLeads = partner.affiliates.flatMap(affiliate =>
    affiliate.leads.map(lead => ({
      ...lead,
      affiliateName: affiliate.companyName,
      affiliateId: affiliate.id,
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Stats
  const totalLeads = allAffiliateLeads.length
  const leadCount = allAffiliateLeads.filter(l => l.status === LeadStatus.LEAD).length
  const prospectCount = allAffiliateLeads.filter(l => l.status === LeadStatus.PROSPECT).length
  const clientCount = allAffiliateLeads.filter(l => l.status === LeadStatus.CLIENT).length
  const archivedCount = allAffiliateLeads.filter(l => l.status === LeadStatus.ARCHIVED).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case LeadStatus.CLIENT:
        return 'bg-green-100 text-green-800'
      case LeadStatus.PROSPECT:
        return 'bg-blue-100 text-blue-800'
      case LeadStatus.LEAD:
        return 'bg-gray-100 text-gray-800'
      case LeadStatus.ARCHIVED:
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar canHaveAffiliates={partner.canHaveAffiliates} />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/partner/affiliates"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-omniwallet-primary mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Afiliados
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Leads de Afiliados</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualiza todos los leads generados por tus afiliados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500">Total</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{totalLeads}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500">Leads</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{leadCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-xs font-medium text-blue-600">Prospects</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{prospectCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-xs font-medium text-green-600">Clientes</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{clientCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-xs font-medium text-amber-600">Archivados</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{archivedCount}</p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-omniwallet-primary" />
              <h2 className="text-base font-semibold text-gray-900">
                Todos los Leads de Afiliados ({totalLeads})
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {partner.affiliates.length} afiliados activos
            </div>
          </div>

          <div className="overflow-x-auto">
            {allAffiliateLeads.length === 0 ? (
              <div className="text-center py-16">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No hay leads de afiliados</p>
                <p className="text-sm text-gray-400">
                  Tus afiliados aún no han generado leads
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Afiliado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Empresa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contacto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Comisión
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pagos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allAffiliateLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-900">{lead.affiliateName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.companyName}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.contactName}</div>
                        <div className="text-xs text-gray-500">{lead.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.commissionRate}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {lead.payments.length}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Info box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los leads mostrados aquí son generados por tus afiliados activos.
            Las comisiones de estos leads se dividen entre tú y el afiliado según la configuración establecida.
          </p>
        </div>
      </main>
    </div>
  )
}
