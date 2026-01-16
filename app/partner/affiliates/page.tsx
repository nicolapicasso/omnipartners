import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Users, TrendingUp, DollarSign, Clock } from 'lucide-react'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'
import { AffiliatesList, CreateAffiliateForm } from './AffiliatesContent'

export default async function AffiliatesPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: {
      affiliates: {
        include: {
          leads: {
            select: {
              id: true,
              status: true,
            },
          },
          _count: {
            select: {
              leads: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        // Include temporaryPassword for the parent partner to see
      },
    },
  })

  // Separately fetch temporaryPassword for each affiliate (only for PENDING affiliates)
  const affiliatesWithPasswords = await prisma.partner.findMany({
    where: {
      parentPartnerId: partnerId,
      temporaryPassword: { not: null },
    },
    select: {
      id: true,
      temporaryPassword: true,
    },
  })

  const passwordMap = new Map(affiliatesWithPasswords.map(a => [a.id, a.temporaryPassword]))

  if (!partner) {
    return <div>Partner no encontrado</div>
  }

  // If partner cannot have affiliates, redirect to dashboard
  if (!partner.canHaveAffiliates) {
    redirect('/partner')
  }

  // Calculate stats
  const totalAffiliates = partner.affiliates.length
  const activeAffiliates = partner.affiliates.filter(a => a.status === 'ACTIVE').length
  const pendingAffiliates = partner.affiliates.filter(a => a.status === 'PENDING').length
  const totalAffiliateLeads = partner.affiliates.reduce((sum, a) => sum + a._count.leads, 0)
  const totalAffiliateClients = partner.affiliates.reduce(
    (sum, a) => sum + a.leads.filter(l => l.status === 'CLIENT').length,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar canHaveAffiliates={partner.canHaveAffiliates} />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Mis Afiliados</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tu red de afiliados y sus comisiones
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-50 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Afiliados</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{totalAffiliates}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-50 p-2.5 rounded-lg">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Afiliados Activos</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{activeAffiliates}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Leads de Afiliados</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{totalAffiliateLeads}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-omniwallet-primary/10 p-2.5 rounded-lg">
                <DollarSign className="w-5 h-5 text-omniwallet-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Clientes de Afiliados</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{totalAffiliateClients}</p>
          </div>
        </div>

        {/* Info about commission structure */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Estructura de Comisiones</p>
              <p className="text-sm text-purple-700 mt-1">
                Tu comisión base es del <strong>{partner.commissionRate || 0}%</strong>.
                Cuando asignas una comisión a un afiliado, esta se resta de tu comisión.
                Por ejemplo, si asignas 10% a un afiliado, tú recibirás {(partner.commissionRate || 0) - 10}% y el afiliado recibirá 10%.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Affiliates List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-base font-semibold text-gray-900">
                  Lista de Afiliados ({totalAffiliates})
                </h2>
                {pendingAffiliates > 0 && (
                  <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {pendingAffiliates} pendiente{pendingAffiliates !== 1 ? 's' : ''} de aprobación
                  </span>
                )}
              </div>
              <AffiliatesList
                affiliates={partner.affiliates.map(a => ({
                  id: a.id,
                  companyName: a.companyName,
                  contactName: a.contactName,
                  email: a.email,
                  status: a.status,
                  affiliateCommission: a.affiliateCommission,
                  leadsCount: a._count.leads,
                  clientsCount: a.leads.filter(l => l.status === 'CLIENT').length,
                  createdAt: a.createdAt.toISOString(),
                  temporaryPassword: passwordMap.get(a.id) || null,
                }))}
                parentCommission={partner.commissionRate || 0}
              />
            </div>
          </div>

          {/* Create Affiliate Form */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Añadir Nuevo Afiliado
              </h3>
              <CreateAffiliateForm
                parentPartnerId={partner.id}
                parentCommission={partner.commissionRate || 0}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
