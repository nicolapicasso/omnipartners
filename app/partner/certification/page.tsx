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
      id: true,
      companyName: true,
      isCertified: true,
      certifiedAt: true,
      certificationExpiresAt: true,
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

  // Fetch certification settings for badge URLs
  const settings = await prisma.certificationSettings.findFirst()

  // Get base URL from environment or default
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://partners.omniwallet.com'

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <CertificationPortal
          partnerId={partner.id}
          isCertified={partner.isCertified}
          certifiedAt={partner.certifiedAt}
          expiresAt={partner.certificationExpiresAt}
          contents={contents}
          questions={questions}
          attempts={attempts}
          badgeLightUrl={settings?.badgeLightUrl || null}
          badgeDarkUrl={settings?.badgeDarkUrl || null}
          baseUrl={baseUrl}
        />
      </main>
    </div>
  )
}
