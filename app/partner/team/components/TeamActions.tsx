'use client'

import { useState } from 'react'
import { UserRole } from '@/types'
import { inviteTeamMember, removeTeamMember, updateTeamMemberRole } from '../actions'
import { User, Mail, Shield, Trash2, Check, Copy, CheckCircle } from 'lucide-react'

interface CreatedUser {
  name: string
  email: string
  tempPassword: string
  emailSent: boolean
  createdAt: Date
}

export function InviteTeamMemberForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.PARTNER_USER,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.name || !formData.email) {
      setError('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    const result = await inviteTeamMember(formData)

    if (result.success && result.tempPassword) {
      // Add new user to the list of created users
      setCreatedUsers(prev => [
        {
          name: formData.name,
          email: formData.email,
          tempPassword: result.tempPassword!,
          emailSent: result.emailSent ?? false,
          createdAt: new Date(),
        },
        ...prev,
      ])
      setFormData({ name: '', email: '', role: UserRole.PARTNER_USER })
    } else {
      setError(result.error || 'Error al invitar al miembro')
    }

    setLoading(false)
  }

  const handleCopyPassword = async (password: string, index: number) => {
    try {
      await navigator.clipboard.writeText(password)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      // Fallback for browsers that don't support clipboard API
      alert(`Contraseña: ${password}`)
    }
  }

  const handleDismissUser = (index: number) => {
    setCreatedUsers(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* List of recently created users */}
      {createdUsers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Usuarios creados en esta sesión ({createdUsers.length}):
          </h4>
          {createdUsers.map((user, index) => (
            <div
              key={`${user.email}-${index}`}
              className="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-green-800 font-semibold text-sm mb-2">
                  <CheckCircle className="w-4 h-4" />
                  {user.name}
                </div>
                <button
                  onClick={() => handleDismissUser(index)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                  title="Descartar"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-2">{user.email}</p>
              <div className="p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Contraseña temporal:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-green-700 bg-green-50 px-2 py-1 rounded">
                    {user.tempPassword}
                  </code>
                  <button
                    onClick={() => handleCopyPassword(user.tempPassword, index)}
                    className="p-1 text-gray-500 hover:text-omniwallet-primary transition"
                    title="Copiar contraseña"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {user.emailSent
                    ? '✉️ Se ha enviado un email con los datos de acceso.'
                    : '⚠️ Comparte esta contraseña de forma segura con el nuevo miembro.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              placeholder="Nombre completo"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
              placeholder="email@ejemplo.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
            >
              <option value={UserRole.PARTNER_USER}>Usuario</option>
              <option value={UserRole.PARTNER_OWNER}>Propietario</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-omniwallet-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-omniwallet-secondary transition disabled:opacity-50"
        >
          {loading ? 'Invitando...' : 'Invitar Miembro'}
        </button>
      </form>
    </div>
  )
}

export function RemoveTeamMemberButton({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    const result = await removeTeamMember(userId)
    if (!result.success) {
      alert(result.error || 'Error al eliminar el miembro')
    }
    setLoading(false)
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Eliminar miembro"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowConfirm(false)}
        disabled={loading}
        className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
      >
        Cancelar
      </button>
      <button
        onClick={handleRemove}
        disabled={loading}
        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
      >
        {loading ? 'Eliminando...' : 'Confirmar'}
      </button>
    </div>
  )
}

export function UpdateRoleButton({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: string
}) {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(currentRole)

  const handleUpdate = async (newRole: UserRole) => {
    setLoading(true)
    const result = await updateTeamMemberRole(userId, newRole)
    if (result.success) {
      setRole(newRole)
    } else {
      alert(result.error || 'Error al actualizar el rol')
    }
    setLoading(false)
  }

  return (
    <select
      value={role}
      onChange={(e) => handleUpdate(e.target.value as UserRole)}
      disabled={loading}
      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent disabled:opacity-50"
    >
      <option value={UserRole.PARTNER_USER}>Usuario</option>
      <option value={UserRole.PARTNER_OWNER}>Propietario</option>
    </select>
  )
}
