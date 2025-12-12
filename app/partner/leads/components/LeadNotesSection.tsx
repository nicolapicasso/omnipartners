'use client'

import { useState } from 'react'
import { MessageSquare, Send, User, Clock } from 'lucide-react'
import { addLeadNote } from '../actions'

interface LeadNote {
  id: string
  authorName: string
  content: string
  createdAt: Date
}

interface LeadNotesSectionProps {
  leadId: string
  notes: LeadNote[]
}

export default function LeadNotesSection({ leadId, notes }: LeadNotesSectionProps) {
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setLoading(true)
    setError('')

    const result = await addLeadNote(leadId, newNote.trim())

    if (result.success) {
      setNewNote('')
    } else {
      setError(result.error || 'Error al añadir la nota')
    }
    setLoading(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-omniwallet-primary" />
          <h2 className="text-base font-semibold text-gray-900">
            Historial de Notas ({notes.length})
          </h2>
        </div>
      </div>

      {/* Form to add new note */}
      <form onSubmit={handleSubmit} className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Añadir una nota sobre el estado del lead..."
            rows={2}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent resize-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newNote.trim()}
            className="self-end bg-omniwallet-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-omniwallet-secondary transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Enviando...' : 'Añadir'}
          </button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </form>

      {/* Notes list */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay notas todavía</p>
            <p className="text-xs text-gray-400 mt-1">
              Añade notas para hacer seguimiento del lead
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-omniwallet-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-omniwallet-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {note.authorName}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
