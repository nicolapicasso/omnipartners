import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { PartnerStatus } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CreateLeadForm from '../components/CreateLeadForm'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'

export default async function NewLeadPage() {
  const session = await getAdminSession()

  const activePartners = await prisma.partner.findMany({
    where: { status: PartnerStatus.ACTIVE },
    orderBy: { companyName: 'asc' },
    select: {
      id: true,
      companyName: true,
      email: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-32 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-omniwallet-primary mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Leads
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Lead</h1>
            <p className="text-sm text-gray-500 mt-1">
              Assign a new lead to an active partner
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {activePartners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  No hay partners activos. Debes aprobar al menos un partner antes de crear
                  leads.
                </p>
                <Link
                  href="/admin/partners"
                  className="text-omniwallet-primary hover:text-omniwallet-secondary font-semibold"
                >
                  Ir a Partners →
                </Link>
              </div>
            ) : (
              <CreateLeadForm partners={activePartners} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
