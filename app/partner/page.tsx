import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { PartnerDashboardStats, LeadStatus } from '@/types'
import { TrendingUp, Users, DollarSign, CheckCircle, Clock, Target } from 'lucide-react'
import Link from 'next/link'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'

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
      <PartnerSidebar />

      <main className="ml-64 pt-20 px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your partner performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <Target className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Leads</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.totalLeads}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Prospects</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.totalProspects}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 p-2.5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Clients</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.totalClients}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-omniwallet-primary/10 p-2.5 rounded-lg">
                <DollarSign className="w-5 h-5 text-omniwallet-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Commissions</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              €{stats.totalCommissions.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-50 p-2.5 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Pending Payment</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              €{stats.pendingCommissions.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-omniwallet-accent/10 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-omniwallet-accent" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Team Members</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {teamMembers.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Recent Leads</h2>
              <Link
                href="/partner/leads"
                className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-medium transition"
              >
                View all
              </Link>
            </div>
            <div className="p-6">
              {recentLeads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-sm mb-4">No leads yet</p>
                  <Link
                    href="/partner/leads/new"
                    className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
                  >
                    Create your first lead
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/partner/leads/${lead.id}`}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition cursor-pointer group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-omniwallet-primary transition">
                          {lead.companyName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{lead.contactName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            lead.status === 'CLIENT'
                              ? 'bg-green-50 text-green-700'
                              : lead.status === 'PROSPECT'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Team</h2>
              <Link
                href="/partner/team"
                className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-medium transition"
              >
                Manage
              </Link>
            </div>
            <div className="p-6">
              {teamMembers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-sm mb-4">No team members</p>
                  <Link
                    href="/partner/team"
                    className="inline-flex items-center gap-2 bg-omniwallet-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-omniwallet-secondary transition"
                  >
                    Invite members
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          member.role === 'PARTNER_OWNER'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-blue-50 text-blue-700'
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/partner/leads/new"
              className="flex items-start gap-3 p-4 rounded-md border border-gray-200 hover:border-omniwallet-primary hover:bg-omniwallet-primary/5 transition group"
            >
              <div className="bg-omniwallet-primary/10 p-2 rounded-md group-hover:bg-omniwallet-primary/20 transition">
                <TrendingUp className="w-5 h-5 text-omniwallet-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Create Lead</p>
                <p className="text-xs text-gray-500 mt-1">Add a new lead to your pipeline</p>
              </div>
            </Link>
            <Link
              href="/partner/commissions"
              className="flex items-start gap-3 p-4 rounded-md border border-gray-200 hover:border-green-500 hover:bg-green-50/50 transition group"
            >
              <div className="bg-green-50 p-2 rounded-md group-hover:bg-green-100 transition">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">View Commissions</p>
                <p className="text-xs text-gray-500 mt-1">Check your earnings</p>
              </div>
            </Link>
            <Link
              href="/partner/team"
              className="flex items-start gap-3 p-4 rounded-md border border-gray-200 hover:border-omniwallet-accent hover:bg-omniwallet-accent/5 transition group"
            >
              <div className="bg-omniwallet-accent/10 p-2 rounded-md group-hover:bg-omniwallet-accent/20 transition">
                <Users className="w-5 h-5 text-omniwallet-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Team</p>
                <p className="text-xs text-gray-500 mt-1">Invite and manage members</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
