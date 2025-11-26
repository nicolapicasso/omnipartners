import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'
import CertificationPortal from './CertificationPortal'

export default async function PartnerCertificationPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: {
      companyName: true,
      isCertified: true,
      certifiedAt: true,
    },
  })

  if (!partner) {
    return <div>Partner not found</div>
  }

  // Fetch published content
  const contents = await prisma.certificationContent.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
  })

  // Fetch active questions
  const questions = await prisma.certificationQuestion.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      question: true,
      options: true,
      order: true,
      // Don't send correctAnswer or explanation to client
    },
  })

  // Fetch previous attempts
  const attempts = await prisma.certificationAttempt.findMany({
    where: { partnerId },
    orderBy: { completedAt: 'desc' },
    take: 10,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar />

      <main className="lg:ml-64 pt-24 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <CertificationPortal
          isCertified={partner.isCertified}
          certifiedAt={partner.certifiedAt}
          contents={contents}
          questions={questions}
          attempts={attempts}
        />
      </main>
    </div>
  )
}
