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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <CertificationManagement contents={contents} questions={questions} />
      </main>
    </div>
  )
}
