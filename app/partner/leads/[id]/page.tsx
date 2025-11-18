import { prisma } from '@/lib/prisma'
import { getPartnerSession } from '@/lib/session'
import { LeadStatus } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, MapPin, Calendar, DollarSign, User, Pencil } from 'lucide-react'
import { DeleteLeadButton } from '../components/LeadActions'

export default async function PartnerLeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getPartnerSession()
  const partnerId = session.user.partnerId!

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

  // Verify lead belongs to partner
  if (!lead || lead.partnerId !== partnerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Lead no encontrado</h1>
          <Link
            href="/partner/leads"
            className="text-omniwallet-primary hover:text-omniwallet-secondary"
          >
            ← Volver a Mis Leads
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
      <header className="bg-omniwallet-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/partner/leads"
            className="inline-flex items-center gap-2 text-white hover:text-omniwallet-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Leads
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{lead.companyName}</h1>
              <p className="text-omniwallet-light mt-2">
                Creado por: {lead.createdBy.name}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(
                lead.status
              )}`}
            >
              {lead.status}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Información del Lead
                </h2>
                <Link
                  href={`/partner/leads/${lead.id}/edit`}
                  className="text-omniwallet-primary hover:text-omniwallet-secondary inline-flex items-center gap-1 text-sm font-semibold"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </Link>
              </div>
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
                    <p className="text-gray-900">{lead.createdBy.name}</p>
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

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-md">
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
                          Tu Comisión
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
            <div className="bg-white rounded-lg shadow-md p-6">
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
                    <span className="text-sm text-gray-600">Tus Comisiones</span>
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

            {/* Commission Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Configuración de Comisión
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Tipo de Comisión</p>
                  <p className="text-gray-900 font-medium mt-1">{lead.commissionType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tasa de Comisión</p>
                  <p className="text-2xl font-bold text-omniwallet-primary mt-1">
                    {lead.commissionRate}%
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  La configuración de comisión es establecida por el administrador
                </p>
              </div>
            </div>

            {/* Actions */}
            {lead.status !== LeadStatus.CLIENT && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones</h3>
                <DeleteLeadButton leadId={lead.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
