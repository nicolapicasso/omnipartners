import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { UserRole } from '@/types'
import Link from 'next/link'
import { Users, UserPlus, Mail, Shield } from 'lucide-react'
import { InviteTeamMemberForm, RemoveTeamMemberButton, UpdateRoleButton } from './components/TeamActions'
import PartnerDashboardHeader from '@/components/PartnerDashboardHeader'
import PartnerSidebar from '@/components/PartnerSidebar'

export default async function PartnerTeamPage() {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  })

  if (!partner) {
    return <div>Partner not found</div>
  }

  const teamMembers = await prisma.user.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { leadsCreated: true },
      },
    },
  })

  const isOwner = session.user.role === UserRole.PARTNER_OWNER

  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.PARTNER_OWNER:
        return 'bg-omniwallet-primary text-white'
      case UserRole.PARTNER_USER:
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case UserRole.PARTNER_OWNER:
        return 'Propietario'
      case UserRole.PARTNER_USER:
        return 'Usuario'
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboardHeader
        userName={session.user.name || 'Partner'}
        companyName={partner.companyName}
      />
      <PartnerSidebar />

      <main className="lg:ml-64 pt-24 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            {teamMembers.length} team members
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Team Members</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-omniwallet-primary bg-opacity-10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-omniwallet-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">{member.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                              member.role
                            )}`}
                          >
                            {getRoleLabel(member.role)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {member._count.leadsCreated} leads creados
                          </span>
                        </div>
                      </div>

                      {isOwner && member.role !== UserRole.PARTNER_OWNER && (
                        <div className="flex items-center gap-2 ml-4">
                          <UpdateRoleButton userId={member.id} currentRole={member.role} />
                          <RemoveTeamMemberButton userId={member.id} userName={member.name} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Form */}
            {isOwner ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Invite Member
                </h3>
                <InviteTeamMemberForm />
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
                <Shield className="w-8 h-8 text-blue-600 mb-3" />
                <p className="text-sm text-blue-800">
                  Only the partner owner can invite new team members.
                </p>
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Miembros</span>
                  <span className="text-xl font-bold text-gray-900">{teamMembers.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Propietarios</span>
                  <span className="text-xl font-bold text-omniwallet-primary">
                    {teamMembers.filter((m) => m.role === UserRole.PARTNER_OWNER).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Usuarios</span>
                  <span className="text-xl font-bold text-blue-600">
                    {teamMembers.filter((m) => m.role === UserRole.PARTNER_USER).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
