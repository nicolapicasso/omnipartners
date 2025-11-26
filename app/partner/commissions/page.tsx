import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'
import CommissionsContent from './CommissionsContent'

export default async function PartnerCommissionsPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  })

  if (!partner) {
    return <div>Partner not found</div>
  }

  // Get all payments for this partner's leads
  const payments = await prisma.payment.findMany({
    where: {
      lead: { partnerId },
    },
    include: {
      lead: true,
      invoices: {
        include: {
          invoice: true,
        },
      },
    },
    orderBy: { paymentDate: 'desc' },
  })

  // Get invoices for this partner
  const invoices = await prisma.invoice.findMany({
    where: { partnerId },
    include: {
      payments: {
        include: {
          payment: {
            include: {
              lead: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate stats
  const totalCommissions = payments.reduce((sum, p) => sum + p.commissionAmount, 0)
  const paidCommissions = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)
  const pendingCommissions = totalCommissions - paidCommissions

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-32 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <CommissionsContent
          payments={payments}
          invoices={invoices}
          totalCommissions={totalCommissions}
          paidCommissions={paidCommissions}
          pendingCommissions={pendingCommissions}
        />
      </main>
    </div>
  )
}
