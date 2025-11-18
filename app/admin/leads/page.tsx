import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { LeadStatus, CommissionType } from '@/types'
import Link from 'next/link'
import { Eye, Plus } from 'lucide-react'

export default async function LeadsPage() {
  await getAdminSession()

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      partner: true,
      createdBy: true,
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

  const getCommissionColor = (type: string) => {
    switch (type) {
      case CommissionType.AGENCY_PARTNER:
        return 'bg-purple-100 text-purple-800'
      case CommissionType.TECH_PARTNER:
        return 'bg-indigo-100 text-indigo-800'
      case CommissionType.REFERRAL:
        return 'bg-pink-100 text-pink-800'
      case CommissionType.CUSTOM:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-omniwallet-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Leads</h1>
              <p className="text-omniwallet-light mt-2">Total: {leads.length} leads</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/leads/new"
                className="bg-omniwallet-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-600 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear Lead
              </Link>
              <Link
                href="/admin"
                className="bg-white text-omniwallet-primary px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-light transition"
              >
                ← Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
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
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo Comisión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tasa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
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
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.partner.companyName}
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCommissionColor(
                          lead.commissionType
                        )}`}
                      >
                        {lead.commissionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.commissionRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/leads/${lead.id}`}
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
          </div>
        </div>
      </main>
    </div>
  )
}
