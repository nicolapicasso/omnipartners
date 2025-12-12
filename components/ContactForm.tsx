'use client'

import { useState } from 'react'
import { User, Mail, Phone, Briefcase, Trash2, Plus, Star } from 'lucide-react'
import PhoneInput from './PhoneInput'

export interface ContactData {
  id?: string
  name: string
  email: string
  phone: string
  phoneCountryCode: string
  jobTitle: string
  isPrimary: boolean
}

interface ContactFormProps {
  contacts: ContactData[]
  onChange: (contacts: ContactData[]) => void
  errors?: { [key: number]: { [field: string]: string } }
}

const emptyContact: ContactData = {
  name: '',
  email: '',
  phone: '',
  phoneCountryCode: '+34',
  jobTitle: '',
  isPrimary: false,
}

export default function ContactForm({ contacts, onChange, errors = {} }: ContactFormProps) {
  const handleAddContact = () => {
    const newContact = { ...emptyContact }
    // Si no hay contactos, el primero es el principal
    if (contacts.length === 0) {
      newContact.isPrimary = true
    }
    onChange([...contacts, newContact])
  }

  const handleRemoveContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index)
    // Si eliminamos el contacto principal, el primero pasa a ser principal
    if (contacts[index].isPrimary && newContacts.length > 0) {
      newContacts[0].isPrimary = true
    }
    onChange(newContacts)
  }

  const handleContactChange = (index: number, field: keyof ContactData, value: string | boolean) => {
    const newContacts = [...contacts]
    newContacts[index] = { ...newContacts[index], [field]: value }
    onChange(newContacts)
  }

  const handleSetPrimary = (index: number) => {
    const newContacts = contacts.map((contact, i) => ({
      ...contact,
      isPrimary: i === index,
    }))
    onChange(newContacts)
  }

  const handlePhoneChange = (index: number, fullPhone: string) => {
    // Extraer el código de país y el número
    const parts = fullPhone.split(' ')
    const phoneCountryCode = parts[0] || '+34'
    const phone = parts.slice(1).join(' ')

    const newContacts = [...contacts]
    newContacts[index] = {
      ...newContacts[index],
      phone,
      phoneCountryCode,
    }
    onChange(newContacts)
  }

  const getFullPhone = (contact: ContactData) => {
    if (!contact.phone) return ''
    return `${contact.phoneCountryCode || '+34'} ${contact.phone}`.trim()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold text-gray-700">Personas de Contacto</h4>
        <button
          type="button"
          onClick={handleAddContact}
          className="flex items-center gap-1 text-sm text-omniwallet-primary hover:text-omniwallet-secondary transition"
        >
          <Plus className="w-4 h-4" />
          Añadir Contacto
        </button>
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay contactos adicionales</p>
          <button
            type="button"
            onClick={handleAddContact}
            className="mt-2 text-sm text-omniwallet-primary hover:text-omniwallet-secondary transition"
          >
            Añadir primer contacto
          </button>
        </div>
      )}

      {contacts.map((contact, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${
            contact.isPrimary
              ? 'border-omniwallet-primary bg-omniwallet-primary/5'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Contacto {index + 1}
              </span>
              {contact.isPrimary && (
                <span className="flex items-center gap-1 text-xs bg-omniwallet-primary text-white px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3" />
                  Principal
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!contact.isPrimary && contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(index)}
                  className="text-xs text-gray-500 hover:text-omniwallet-primary transition"
                  title="Establecer como principal"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              {contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveContact(index)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Eliminar contacto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent ${
                    errors[index]?.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre completo"
                />
              </div>
              {errors[index]?.name && (
                <p className="text-xs text-red-500 mt-1">{errors[index].name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent ${
                    errors[index]?.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@ejemplo.com"
                />
              </div>
              {errors[index]?.email && (
                <p className="text-xs text-red-500 mt-1">{errors[index].email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={contact.jobTitle}
                  onChange={(e) => handleContactChange(index, 'jobTitle', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent"
                  placeholder="Ej: Director Comercial"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <PhoneInput
                  value={getFullPhone(contact)}
                  onChange={(value) => handlePhoneChange(index, value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
