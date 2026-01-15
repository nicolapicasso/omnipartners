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
    include: {
      affiliates: {
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          companyName: true,
          affiliateCommission: true,
        },
      },
    },
  })

  if (!partner) {
    return <div>Partner not found</div>
  }

  // Get all payments for this partner's leads (own leads)
  const ownPayments = await prisma.payment.findMany({
    where: {
      lead: { partnerId },
    },
    include: {
      lead: {
        include: {
          partner: {
            select: {
              id: true,
              companyName: true,
              parentPartnerId: true,
              affiliateCommission: true,
            },
          },
        },
      },
      invoices: {
        include: {
          invoice: true,
        },
      },
    },
    orderBy: { paymentDate: 'desc' },
  })

  // If this partner can have affiliates, also get payments from affiliate leads
  let affiliatePayments: typeof ownPayments = []
  if (partner.canHaveAffiliates && partner.affiliates.length > 0) {
    const affiliateIds = partner.affiliates.map(a => a.id)
    affiliatePayments = await prisma.payment.findMany({
      where: {
        lead: { partnerId: { in: affiliateIds } },
      },
      include: {
        lead: {
          include: {
            partner: {
              select: {
                id: true,
                companyName: true,
                parentPartnerId: true,
                affiliateCommission: true,
              },
            },
          },
        },
        invoices: {
          include: {
            invoice: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    })
  }

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

  // Calculate stats for own payments
  // For own leads: full commission if not an affiliate's lead
  const ownCommissions = ownPayments.reduce((sum, p) => {
    // Check if this partner is an affiliate
    if (partner.parentPartnerId) {
      // This partner is an affiliate - they only get their affiliate commission portion
      return sum + (p.amount * ((partner.affiliateCommission || 0) / 100))
    }
    // Regular partner - full commission
    return sum + p.commissionAmount
  }, 0)

  // Calculate stats for affiliate payments (parent partner's portion)
  const affiliateCommissions = affiliatePayments.reduce((sum, p) => {
    const affiliate = partner.affiliates.find(a => a.id === p.lead.partnerId)
    if (affiliate) {
      // Parent gets: parentCommission - affiliateCommission
      const parentPortion = (partner.commissionRate - (affiliate.affiliateCommission || 0)) / 100
      return sum + (p.amount * parentPortion)
    }
    return sum
  }, 0)

  const totalCommissions = ownCommissions + affiliateCommissions
  const paidCommissions = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)
  const pendingCommissions = totalCommissions - paidCommissions

  // Combine all payments for display, adding source info
  const allPayments = [
    ...ownPayments.map(p => ({
      ...p,
      source: 'own' as const,
      effectiveCommission: partner.parentPartnerId
        ? p.amount * ((partner.affiliateCommission || 0) / 100)
        : p.commissionAmount,
    })),
    ...affiliatePayments.map(p => {
      const affiliate = partner.affiliates.find(a => a.id === p.lead.partnerId)
      const parentPortion = (partner.commissionRate - (affiliate?.affiliateCommission || 0)) / 100
      return {
        ...p,
        source: 'affiliate' as const,
        affiliateName: affiliate?.companyName || 'Afiliado',
        effectiveCommission: p.amount * parentPortion,
      }
    }),
  ].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar canHaveAffiliates={partner.canHaveAffiliates} />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <CommissionsContent
          payments={allPayments}
          invoices={invoices}
          totalCommissions={totalCommissions}
          paidCommissions={paidCommissions}
          pendingCommissions={pendingCommissions}
          ownCommissions={ownCommissions}
          affiliateCommissions={affiliateCommissions}
          hasAffiliates={partner.canHaveAffiliates && partner.affiliates.length > 0}
        />
      </main>
    </div>
  )
}
