import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'
import CertificationPortal from './CertificationPortal'

export default async function PartnerCertificationPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!
  const cookieStore = await cookies()
  const locale = cookieStore.get('language')?.value || 'es'

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: {
      id: true,
      companyName: true,
      isCertified: true,
      certifiedAt: true,
      certificationExpiresAt: true,
      canHaveAffiliates: true,
    },
  })

  if (!partner) {
    return <div>Partner not found</div>
  }

  // Fetch published content with all translations
  const rawContents = await prisma.certificationContent.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
  })

  // Transform contents based on locale
  const contents = rawContents.map((content) => {
    const titleField = `title_${locale}` as keyof typeof content
    const contentField = `content_${locale}` as keyof typeof content
    const descriptionField = `description_${locale}` as keyof typeof content

    return {
      ...content,
      title: (content[titleField] as string) || content.title,
      content: (content[contentField] as string) || content.content,
      description: (content[descriptionField] as string) || content.description,
    }
  })

  // Fetch active questions with all translations
  const rawQuestions = await prisma.certificationQuestion.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })

  // Transform questions based on locale (don't send correctAnswer to client)
  const questions = rawQuestions.map((q) => {
    const questionField = `question_${locale}` as keyof typeof q
    const optionsField = `options_${locale}` as keyof typeof q

    return {
      id: q.id,
      question: (q[questionField] as string) || q.question,
      options: (q[optionsField] as string) || q.options,
      order: q.order,
    }
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
      <PartnerSidebar canHaveAffiliates={partner.canHaveAffiliates} />

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
