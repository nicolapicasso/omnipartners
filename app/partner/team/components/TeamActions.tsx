'use client'

import { useState } from 'react'
import { UserRole } from '@/types'
import { inviteTeamMember, removeTeamMember, updateTeamMemberRole } from '../actions'
import { User, Mail, Shield, Trash2, Check } from 'lucide-react'

export function InviteTeamMemberForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tempPassword, setTempPassword] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.PARTNER_USER,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setTempPassword('')

    if (!formData.name || !formData.email) {
      setError('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    const result = await inviteTeamMember(formData)

    if (result.success) {
      setSuccess('Miembro invitado correctamente')
      setTempPassword(result.tempPassword || '')
      setFormData({ name: '', email: '', role: UserRole.PARTNER_USER })
    } else {
      setError(result.error || 'Error al invitar al miembro')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800 font-semibold text-sm mb-2">
            <Check className="w-4 h-4" />
            {success}
          </div>
          {tempPassword && (
            <div className="mt-2 p-2 bg-white rounded border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Contraseña temporal:</p>
              <code className="text-sm font-mono text-green-700 bg-green-50 px-2 py-1 rounded">
                {tempPassword}
              </code>
              <p className="text-xs text-gray-500 mt-1">
                Comparte esta contraseña de forma segura con el nuevo miembro
              </p>
            </div>
          )}
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
