import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { LeadStatus } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, MapPin, Calendar, DollarSign, User } from 'lucide-react'
import { UpdateStatusButton, UpdateCommissionForm } from '../components/LeadActions'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getAdminSession()

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      partner: true,
      createdBy: true,
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  })

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Lead no encontrado</h1>
          <Link
            href="/admin/leads"
            className="text-omniwallet-primary hover:text-omniwallet-secondary"
          >
            ← Volver a Leads
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case LeadStatus.CLIENT:
        return 'bg-green-100 text-green-800'
      case LeadStatus.PROSPECT:
        return 'bg-blue-100 text-blue-800'
      case LeadStatus.LEAD:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPayments = lead.payments.reduce((sum, p) => sum + p.amount, 0)
  const totalCommissions = lead.payments.reduce((sum, p) => sum + p.commissionAmount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-24 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-omniwallet-primary mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leads
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{lead.companyName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Partner: {lead.partner.companyName}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                lead.status
              )}`}
            >
              {lead.status}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Información del Lead
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Contacto</p>
                    <p className="text-gray-900">{lead.contactName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{lead.email}</p>
                  </div>
                </div>

                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-gray-900">{lead.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">País</p>
                    <p className="text-gray-900">{lead.country}</p>
                  </div>
                </div>

                {lead.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Sitio Web</p>
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-omniwallet-primary hover:text-omniwallet-secondary"
                      >
                        {lead.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Creación</p>
                    <p className="text-gray-900">
                      {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                {lead.convertedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Convertido a Cliente</p>
                      <p className="text-gray-900">
                        {new Date(lead.convertedAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Creado por</p>
                    <p className="text-gray-900">{lead.createdBy?.name || 'Admin'}</p>
                  </div>
                </div>
              </div>

              {lead.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Notas</p>
                  <p className="text-gray-900 mt-1">{lead.notes}</p>
                </div>
              )}
            </div>

            {/* Partner Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Partner Asignado</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{lead.partner.companyName}</p>
                  <p className="text-sm text-gray-500">{lead.partner.email}</p>
                </div>
                <Link
                  href={`/admin/partners/${lead.partner.id}`}
                  className="text-omniwallet-primary hover:text-omniwallet-secondary text-sm font-semibold"
                >
                  Ver Partner →
                </Link>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Pagos ({lead.payments.length})
                </h2>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Pagado</p>
                  <p className="text-lg font-bold text-gray-900">€{totalPayments.toFixed(2)}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                {lead.payments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No hay pagos registrados
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Comisión
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lead.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.paymentDate).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            €{payment.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            €{payment.commissionAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Total Pagado</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    €{totalPayments.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-omniwallet-primary" />
                    <span className="text-sm text-gray-600">Comisiones</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    €{totalCommissions.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">Pagos</span>
                  <span className="text-xl font-bold text-gray-900">
                    {lead.payments.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Action */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cambiar Estado
              </h3>
              <UpdateStatusButton leadId={lead.id} currentStatus={lead.status} />
            </div>

            {/* Commission Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Configuración de Comisión
              </h3>
              <UpdateCommissionForm
                leadId={lead.id}
                currentType={lead.commissionType}
                currentRate={lead.commissionRate}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

