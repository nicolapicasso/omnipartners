import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { PartnerStatus, LeadStatus, AdminDashboardStats } from '@/types'
import { Users, UserCheck, TrendingUp, Building2, Eye, Plus } from 'lucide-react'
import { ApproveButton, RejectButton } from './components/ActionButtons'
import Link from 'next/link'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'

async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    totalPartners,
    activePartners,
    pendingPartners,
    totalLeads,
    totalClients,
  ] = await Promise.all([
    prisma.partner.count(),
    prisma.partner.count({ where: { status: PartnerStatus.ACTIVE } }),
    prisma.partner.count({ where: { status: PartnerStatus.PENDING } }),
    prisma.lead.count({ where: { status: LeadStatus.LEAD } }),
    prisma.lead.count({ where: { status: LeadStatus.CLIENT } }),
  ])

  // Calculate total revenue and commissions from completed payments
  const payments = await prisma.payment.findMany({
    where: { status: 'COMPLETED' },
  })

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalCommissions = payments.reduce((sum, p) => sum + p.commissionAmount, 0)

  return {
    totalPartners,
    activePartners,
    pendingPartners,
    totalLeads,
    totalClients,
    totalRevenue,
    totalCommissions,
  }
}

export default async function AdminDashboard() {
  const session = await getAdminSession()
  const stats = await getAdminDashboardStats()

  const pendingPartners = await prisma.partner.findMany({
    where: { status: PartnerStatus.PENDING },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const recentPartners = await prisma.partner.findMany({
    where: { status: PartnerStatus.ACTIVE },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      _count: {
        select: { leads: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-omniwallet-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Partners Activos</p>
                <p className="text-3xl font-bold text-omniwallet-primary mt-2">
                  {stats.activePartners}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {stats.totalPartners}
                </p>
              </div>
              <div className="bg-omniwallet-primary/10 p-3 rounded-full">
                <UserCheck className="w-8 h-8 text-omniwallet-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-omniwallet-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Solicitudes Pendientes</p>
                <p className="text-3xl font-bold text-omniwallet-accent mt-2">
                  {stats.pendingPartners}
                </p>
                {stats.pendingPartners > 0 && (
                  <p className="text-xs text-red-500 mt-1">¡Requieren atención!</p>
                )}
              </div>
              <div className="bg-omniwallet-accent/10 p-3 rounded-full">
                <Users className="w-8 h-8 text-omniwallet-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-omniwallet-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Leads</p>
                <p className="text-3xl font-bold text-omniwallet-secondary mt-2">
                  {stats.totalLeads}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Clientes: {stats.totalClients}
                </p>
              </div>
              <div className="bg-omniwallet-secondary/10 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-omniwallet-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Comisiones Totales</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  €{stats.totalCommissions.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresos: €{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests Table */}
        {stats.pendingPartners > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Solicitudes Pendientes
              </h2>
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                {stats.pendingPartners} pendientes
              </span>
            </div>
            <div className="overflow-x-auto">
              {pendingPartners.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay solicitudes pendientes
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        País
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingPartners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {partner.companyName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{partner.contactName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{partner.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{partner.country}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(partner.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <ApproveButton partnerId={partner.id} />
                            <RejectButton partnerId={partner.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Recent Active Partners */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Partners Recientes</h2>
            <Link
              href="/admin/partners"
              className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-semibold flex items-center gap-1"
            >
              Ver todos
              <Eye className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentPartners.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay partners activos
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      País
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {partner.companyName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{partner.contactName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{partner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{partner.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {partner.partnerCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{partner._count.leads}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/partners/${partner.id}`}
                          className="text-omniwallet-primary hover:text-omniwallet-secondary"
                        >
                          Ver detalles
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
