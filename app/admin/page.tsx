import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { PartnerStatus, LeadStatus, AdminDashboardStats } from '@/types'
import { Users, UserCheck, TrendingUp, Building2, Eye, Plus } from 'lucide-react'
import { ApproveButton, RejectButton } from './components/ActionButtons'
import Link from 'next/link'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'

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
      <AdminSidebar />

      <main className="ml-64 pt-20 px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of system performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-omniwallet-primary/10 p-2.5 rounded-lg">
                <UserCheck className="w-5 h-5 text-omniwallet-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Active Partners</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.activePartners}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Total: {stats.totalPartners}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-50 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Pending Requests</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.pendingPartners}
            </p>
            {stats.pendingPartners > 0 && (
              <p className="text-xs text-red-600 mt-2">Requires attention!</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Leads</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.totalLeads}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Clients: {stats.totalClients}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 p-2.5 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Commissions</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              €{stats.totalCommissions.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Revenue: €{stats.totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Pending Requests Table */}
        {stats.pendingPartners > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">
                Pending Requests
              </h2>
              <span className="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
                {stats.pendingPartners} pending
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-900">Recent Partners</h2>
            <Link
              href="/admin/partners"
              className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-medium flex items-center gap-1 transition"
            >
              View all
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
