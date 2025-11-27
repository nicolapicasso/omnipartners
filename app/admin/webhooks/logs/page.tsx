import { getAllWebhookLogs, getWebhookSubscriptions, getAllWebhookEventTypes } from '../actions'
import { getAdminSession } from '@/lib/session'
import AdminDashboardHeader from '@/components/AdminDashboardHeader'
import AdminSidebar from '@/components/AdminSidebar'
import WebhookLogsClient from './WebhookLogsClient'
import { FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{
    subscriptionId?: string
    event?: string
    success?: string
    page?: string
  }>
}

export default async function WebhookLogsPage({ searchParams }: Props) {
  const session = await getAdminSession()
  const params = await searchParams

  const filters = {
    subscriptionId: params.subscriptionId,
    event: params.event,
    success: params.success === 'true' ? true : params.success === 'false' ? false : undefined,
    page: params.page ? parseInt(params.page) : 1,
    limit: 25
  }

  const [logsData, subscriptions, eventTypes] = await Promise.all([
    getAllWebhookLogs(filters),
    getWebhookSubscriptions(),
    getAllWebhookEventTypes()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader userName={session.user.name || 'Admin'} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-28 lg:pt-28 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <Link
            href="/admin/webhooks"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Webhooks
          </Link>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                <FileText className="w-7 h-7 text-omniwallet-primary" />
                Logs de Webhooks
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Historial de eventos enviados a tus suscripciones
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900">{logsData.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Exitosos</p>
            <p className="text-2xl font-bold text-green-600">
              {logsData.logs.filter(l => l.success).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Fallidos</p>
            <p className="text-2xl font-bold text-red-600">
              {logsData.logs.filter(l => !l.success).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pagina</p>
            <p className="text-2xl font-bold text-omniwallet-primary">
              {logsData.page}/{logsData.totalPages || 1}
            </p>
          </div>
        </div>

        {/* Logs with Filters */}
        <WebhookLogsClient
          logs={logsData.logs}
          subscriptions={subscriptions}
          eventTypes={eventTypes}
          currentFilters={filters}
          pagination={{
            page: logsData.page,
            totalPages: logsData.totalPages,
            total: logsData.total
          }}
        />
      </main>
    </div>
  )
}
