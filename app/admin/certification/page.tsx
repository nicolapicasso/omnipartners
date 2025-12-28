import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'
import CertificationManagement from './CertificationManagement'

export default async function AdminCertificationPage() {
  const session = await getAdminSession()

  // Fetch all certification content
  const contents = await prisma.certificationContent.findMany({
    orderBy: { order: 'asc' },
  })

  // Fetch all certification questions
  const questions = await prisma.certificationQuestion.findMany({
    orderBy: { order: 'asc' },
  })

  // Fetch certification settings
  const settings = await prisma.certificationSettings.findFirst()

  // Fetch all partners with certification info and best score
  const partners = await prisma.partner.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      certificationAttempts: {
        orderBy: { score: 'desc' },
        take: 1,
      },
    },
    orderBy: { companyName: 'asc' },
  })

  // Transform partners for the component
  const partnersData = partners.map(partner => ({
    id: partner.id,
    companyName: partner.companyName,
    contactName: partner.contactName,
    email: partner.email,
    website: partner.website,
    isCertified: partner.isCertified,
    certifiedAt: partner.certifiedAt,
    certificationExpiresAt: partner.certificationExpiresAt,
    partnerLandingUrl: partner.partnerLandingUrl,
    bestScore: partner.certificationAttempts[0]?.score || null,
    attemptCount: partner.certificationAttempts.length,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <CertificationManagement
          contents={contents}
          questions={questions}
          settings={settings}
          partners={partnersData}
        />
      </main>
    </div>
  )
}
