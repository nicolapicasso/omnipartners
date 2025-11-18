import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { LeadStatus } from '@/types'
import Link from 'next/link'
import { Eye, Plus, ArrowLeft } from 'lucide-react'

export default async function PartnerLeadsPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const leads = await prisma.lead.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: true,
      _count: {
        select: { payments: true },
      },
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case LeadStatus.CLIENT:
        return 'bg-green-100 text-green-800'
      case LeadStatus.PROSPECT:
        return 'bg-blue-100 text-blue-800'
      case LeadStatus.LEAD:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const leadCount = leads.filter((l) => l.status === LeadStatus.LEAD).length
  const prospectCount = leads.filter((l) => l.status === LeadStatus.PROSPECT).length
  const clientCount = leads.filter((l) => l.status === LeadStatus.CLIENT).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-omniwallet-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 text-white hover:text-omniwallet-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Mis Leads</h1>
              <p className="text-omniwallet-light mt-2">
                {leadCount} Leads · {prospectCount} Prospects · {clientCount} Clientes
              </p>
            </div>
            <Link
              href="/partner/leads/new"
              className="bg-omniwallet-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-600 transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear Lead
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{leadCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Prospects</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{prospectCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Clientes</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{clientCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            {leads.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">No tienes leads todavía</p>
                <Link
                  href="/partner/leads/new"
                  className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-omniwallet-secondary transition"
                >
                  <Plus className="w-5 h-5" />
                  Crear tu primer lead
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Comisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pagos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Creado por
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.companyName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.contactName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.commissionRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead._count.payments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.createdBy.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/partner/leads/${lead.id}`}
                          className="text-omniwallet-primary hover:text-omniwallet-secondary inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
