import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Acceso No Autorizado
        </h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página.
        </p>
        <Link
          href="/"
          className="inline-block bg-omniwallet-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-omniwallet-secondary transition"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}
