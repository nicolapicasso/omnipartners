import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { PartnerStatus } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, MapPin, Calendar, Users, TrendingUp } from 'lucide-react'
import { UpdateCategoryButton, ToggleStatusButton, UpdateContractForm, UpdateOmniwalletAccountForm } from '../components/PartnerActions'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'

export default async function PartnerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getAdminSession()

  const partner = await prisma.partner.findUnique({
    where: { id: params.id },
    include: {
      leads: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { payments: true },
          },
        },
      },
      users: {
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Partner no encontrado</h1>
          <Link
            href="/admin/partners"
            className="text-omniwallet-primary hover:text-omniwallet-secondary"
          >
            ← Volver a Partners
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case PartnerStatus.ACTIVE:
        return 'bg-green-100 text-green-800'
      case PartnerStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case PartnerStatus.REJECTED:
        return 'bg-red-100 text-red-800'
      case PartnerStatus.SUSPENDED:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-20 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/admin/partners"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-omniwallet-primary mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partners
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{partner.companyName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Contact: {partner.contactName}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                partner.status
              )}`}
            >
              {partner.status}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Partner Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Partner Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{partner.email}</p>
                  </div>
                </div>

                {partner.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-gray-900">{partner.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">País</p>
                    <p className="text-gray-900">{partner.country}</p>
                  </div>
                </div>

                {partner.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Sitio Web</p>
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-omniwallet-primary hover:text-omniwallet-secondary"
                      >
                        {partner.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Registro</p>
                    <p className="text-gray-900">
                      {new Date(partner.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                {partner.approvedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Aprobación</p>
                      <p className="text-gray-900">
                        {new Date(partner.approvedAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {partner.address && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="text-gray-900 mt-1">{partner.address}</p>
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones</h2>
              <div className="flex flex-wrap gap-4">
                <UpdateCategoryButton
                  partnerId={partner.id}
                  currentCategory={partner.partnerCategory}
                />
                <ToggleStatusButton
                  partnerId={partner.id}
                  currentStatus={partner.status}
                />
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Leads ({partner.leads.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                {partner.leads.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No hay leads asignados
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Empresa
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {partner.leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/admin/leads/${lead.id}`}
                              className="text-sm font-medium text-omniwallet-primary hover:text-omniwallet-secondary"
                            >
                              {lead.companyName}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {lead.commissionRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead._count.payments}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-omniwallet-primary" />
                    <span className="text-sm text-gray-600">Total Leads</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {partner.leads.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-omniwallet-secondary" />
                    <span className="text-sm text-gray-600">Usuarios</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {partner.users.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Contract Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Partner Contract</h3>
              <UpdateContractForm partnerId={partner.id} currentContractUrl={partner.contractUrl} />
            </div>

            {/* Omniwallet Account Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Omniwallet Account</h3>
              <UpdateOmniwalletAccountForm partnerId={partner.id} currentAccountUrl={partner.omniwalletAccountUrl} />
            </div>

            {/* Users Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Usuarios ({partner.users.length})
              </h3>
              {partner.users.length === 0 ? (
                <p className="text-sm text-gray-500">No hay usuarios registrados</p>
              ) : (
                <div className="space-y-3">
                  {partner.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
