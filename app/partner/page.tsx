import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { PartnerDashboardStats, LeadStatus } from '@/types'
import { TrendingUp, Users, DollarSign, CheckCircle, Clock, Target } from 'lucide-react'
import Link from 'next/link'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'

async function getPartnerStats(partnerId: string): Promise<PartnerDashboardStats> {
  const [totalLeads, totalProspects, totalClients] = await Promise.all([
    prisma.lead.count({ where: { partnerId, status: LeadStatus.LEAD } }),
    prisma.lead.count({ where: { partnerId, status: LeadStatus.PROSPECT } }),
    prisma.lead.count({ where: { partnerId, status: LeadStatus.CLIENT } }),
  ])

  // Calculate commissions from payments
  const payments = await prisma.payment.findMany({
    where: {
      lead: { partnerId },
      status: 'COMPLETED',
    },
  })

  const totalCommissions = payments.reduce((sum, p) => sum + p.commissionAmount, 0)

  // Get pending invoices total
  const pendingInvoices = await prisma.invoice.findMany({
    where: {
      partnerId,
      status: { in: ['DRAFT', 'SENT'] },
    },
  })

  const pendingCommissions = pendingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paidCommissions = totalCommissions - pendingCommissions

  return {
    totalLeads,
    totalProspects,
    totalClients,
    totalCommissions,
    pendingCommissions,
    paidCommissions,
  }
}

export default async function PartnerDashboard() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  })

  if (!partner) {
    return <div>Partner no encontrado</div>
  }

  const stats = await getPartnerStats(partnerId)

  // Get recent leads
  const recentLeads = await prisma.lead.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      _count: {
        select: { payments: true },
      },
    },
  })

  // Get team members
  const teamMembers = await prisma.user.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalLeads}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <Target className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Prospects</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.totalProspects}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Clientes</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.totalClients}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-omniwallet-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Comisiones</p>
                <p className="text-3xl font-bold text-omniwallet-primary mt-2">
                  €{stats.totalCommissions.toFixed(2)}
                </p>
              </div>
              <div className="bg-omniwallet-primary/10 p-3 rounded-full">
                <DollarSign className="w-8 h-8 text-omniwallet-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pendientes de Pago</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  €{stats.pendingCommissions.toFixed(2)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-omniwallet-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Miembros del Equipo</p>
                <p className="text-3xl font-bold text-omniwallet-accent mt-2">
                  {teamMembers.length}
                </p>
              </div>
              <div className="bg-omniwallet-accent/10 p-3 rounded-full">
                <Users className="w-8 h-8 text-omniwallet-accent" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Leads Recientes</h2>
              <Link
                href="/partner/leads"
                className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-semibold"
              >
                Ver todos →
              </Link>
            </div>
            <div className="p-6">
              {recentLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No tienes leads todavía</p>
                  <Link
                    href="/partner/leads/new"
                    className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-secondary transition"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Crear tu primer lead
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div>
                        <Link
                          href={`/partner/leads/${lead.id}`}
                          className="font-medium text-gray-900 hover:text-omniwallet-primary"
                        >
                          {lead.companyName}
                        </Link>
                        <p className="text-sm text-gray-500">{lead.contactName}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            lead.status === 'CLIENT'
                              ? 'bg-green-100 text-green-800'
                              : lead.status === 'PROSPECT'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {lead.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {lead._count.payments} pagos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Mi Equipo</h2>
              <Link
                href="/partner/team"
                className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-semibold"
              >
                Gestionar →
              </Link>
            </div>
            <div className="p-6">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No hay miembros en el equipo</p>
                  <Link
                    href="/partner/team"
                    className="inline-flex items-center gap-2 bg-omniwallet-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    <Users className="w-4 h-4" />
                    Invitar miembros
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          member.role === 'PARTNER_OWNER'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {member.role === 'PARTNER_OWNER' ? 'Owner' : 'User'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-omniwallet-primary/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/partner/leads/new"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <TrendingUp className="w-6 h-6 text-omniwallet-primary" />
              <div>
                <p className="font-semibold text-gray-900">Crear Lead</p>
                <p className="text-sm text-gray-500">Añade un nuevo lead</p>
              </div>
            </Link>
            <Link
              href="/partner/commissions"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <DollarSign className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">Ver Comisiones</p>
                <p className="text-sm text-gray-500">Revisa tus ganancias</p>
              </div>
            </Link>
            <Link
              href="/partner/team"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <Users className="w-6 h-6 text-omniwallet-accent" />
              <div>
                <p className="font-semibold text-gray-900">Gestionar Equipo</p>
                <p className="text-sm text-gray-500">Invita a tu equipo</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
