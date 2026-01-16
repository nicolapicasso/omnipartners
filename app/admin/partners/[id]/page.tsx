import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { PartnerStatus } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, MapPin, Calendar, Users, TrendingUp, Key, AlertCircle } from 'lucide-react'
import { UpdateCategoryButton, ToggleStatusButton, UpdateContractForm, UpdateOmniwalletAccountForm, ToggleYearlyEventButton, ToggleAffiliatesButton, UpdateCommissionRateForm, DeletePartnerButton } from '../components/PartnerActions'
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
      affiliates: {
        select: {
          id: true,
          companyName: true,
          status: true,
          affiliateCommission: true,
        },
      },
      parentPartner: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  })

  // Fetch temporaryPassword separately for security (only if this is an affiliate)
  let temporaryPassword: string | null = null
  if (partner?.parentPartnerId) {
    const affiliateWithPassword = await prisma.partner.findUnique({
      where: { id: params.id },
      select: { temporaryPassword: true },
    })
    temporaryPassword = affiliateWithPassword?.temporaryPassword || null
  }

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

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/admin/partners"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-omniwallet-primary mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Partners
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{partner.companyName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Contacto: {partner.contactName}
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
                Información del Partner
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

              {/* Danger Zone */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Zona de peligro</h3>
                <DeletePartnerButton
                  partnerId={partner.id}
                  partnerName={partner.companyName}
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

            {/* Commission Rate Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Comisión</h3>
              <UpdateCommissionRateForm partnerId={partner.id} currentRate={partner.commissionRate} />
            </div>

            {/* Contract Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contrato del Partner</h3>
              <UpdateContractForm partnerId={partner.id} currentContractUrl={partner.contractUrl} />
            </div>

            {/* Omniwallet Account Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cuenta Omniwallet</h3>
              <UpdateOmniwalletAccountForm partnerId={partner.id} currentAccountUrl={partner.omniwalletAccountUrl} />
            </div>

            {/* Yearly Event Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Requisitos Anuales</h3>
              <ToggleYearlyEventButton partnerId={partner.id} hasCompletedYearlyEvent={partner.hasCompletedYearlyEvent} />
            </div>

            {/* Affiliates Card - Only show if not an affiliate themselves */}
            {!partner.parentPartnerId && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sistema de Afiliados</h3>
                <ToggleAffiliatesButton
                  partnerId={partner.id}
                  canHaveAffiliates={partner.canHaveAffiliates}
                  affiliatesCount={partner.affiliates.length}
                />
                {partner.affiliates.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Afiliados:</p>
                    <div className="space-y-2">
                      {partner.affiliates.map((affiliate) => (
                        <Link
                          key={affiliate.id}
                          href={`/admin/partners/${affiliate.id}`}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
                        >
                          <span className="text-sm text-gray-900">{affiliate.companyName}</span>
                          <span className="text-xs text-purple-600 font-medium">
                            {affiliate.affiliateCommission}%
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Parent Partner Card - Only show if this is an affiliate */}
            {partner.parentPartner && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Partner Padre</h3>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Este partner es afiliado de:</p>
                    <Link
                      href={`/admin/partners/${partner.parentPartner.id}`}
                      className="text-omniwallet-primary hover:text-omniwallet-secondary font-medium"
                    >
                      {partner.parentPartner.companyName}
                    </Link>
                    {partner.affiliateCommission && (
                      <p className="text-xs text-gray-500 mt-1">
                        Comisión asignada: <span className="font-medium text-purple-600">{partner.affiliateCommission}%</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Affiliate Credentials Card - Only show for affiliates with temporary password */}
            {partner.parentPartner && temporaryPassword && (
              <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200 p-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Credenciales de Acceso
                </h3>
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded mt-1">
                        {partner.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Contraseña temporal</p>
                      <p className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded mt-1">
                        {temporaryPassword}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Esta contraseña se eliminará automáticamente cuando el afiliado inicie sesión por primera vez.
                    Se enviará por email al aprobar la cuenta.
                  </p>
                </div>
              </div>
            )}

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
