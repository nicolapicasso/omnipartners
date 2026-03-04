import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'
import ContractsManagement from './ContractsManagement'

export default async function AdminContractsPage() {
  const session = await getAdminSession()

  // Fetch all contract templates
  const templates = await prisma.contractTemplate.findMany({
    orderBy: [
      { partnerCategory: 'asc' },
      { order: 'asc' },
    ],
    include: {
      _count: {
        select: { contracts: true },
      },
    },
  })

  // Fetch all contracts with partner info
  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      partner: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          partnerCategory: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Get all active partners for assigning contracts
  const partners = await prisma.partner.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      companyName: true,
      partnerCategory: true,
      contractUrl: true,
    },
    orderBy: { companyName: 'asc' },
  })

  // Count contracts by status
  const statusCounts = {
    pending: contracts.filter(c => c.status === 'PENDING_SIGNATURE').length,
    signed: contracts.filter(c => c.status === 'SIGNED').length,
    cancelled: contracts.filter(c => c.status === 'CANCELLED').length,
    expired: contracts.filter(c => c.status === 'EXPIRED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <ContractsManagement
          templates={templates}
          contracts={contracts}
          partners={partners}
          statusCounts={statusCounts}
        />
      </main>
    </div>
  )
}
