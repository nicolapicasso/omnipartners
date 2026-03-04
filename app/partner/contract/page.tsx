import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'
import ContractSignature from './ContractSignature'

export default async function PartnerContractPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      email: true,
      address: true,
      canHaveAffiliates: true,
    },
  })

  if (!partner) {
    return <div>Partner no encontrado</div>
  }

  // Get pending or signed contract
  const contract = await prisma.contract.findFirst({
    where: {
      partnerId,
      status: { in: ['PENDING_SIGNATURE', 'SIGNED'] },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      template: {
        select: { name: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar canHaveAffiliates={partner.canHaveAffiliates} />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <ContractSignature
          contract={contract}
          partner={{
            companyName: partner.companyName,
            contactName: partner.contactName,
            email: partner.email,
            address: partner.address,
          }}
        />
      </main>
    </div>
  )
}
