'use client'

import { useState } from 'react'
import Select from 'react-select'
import { countries, Country } from '@/lib/countries'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  className?: string
}

export default function PhoneInput({ value, onChange, error, required = false, className = '' }: PhoneInputProps) {
  const parsePhoneNumber = (phoneValue: string) => {
    // Por defecto España (+34)
    if (!phoneValue) return { dialCode: '+34', number: '' }

    const matchingCountry = countries.find(c => phoneValue.startsWith(c.dialCode))
    if (matchingCountry) {
      return {
        dialCode: matchingCountry.dialCode,
        number: phoneValue.substring(matchingCountry.dialCode.length).trim()
      }
    }

    return { dialCode: '+34', number: phoneValue }
  }

  const { dialCode: initialDialCode, number: initialNumber } = parsePhoneNumber(value)
  const [dialCode, setDialCode] = useState(initialDialCode)
  const [number, setNumber] = useState(initialNumber)

  const dialCodeOptions = countries.map(country => ({
    value: country.dialCode,
    label: `${country.code} ${country.dialCode}`,
    country: country
  }))

  const selectedDialCode = dialCodeOptions.find(opt => opt.value === dialCode) || dialCodeOptions[0]

  const handleDialCodeChange = (option: any) => {
    const newDialCode = option?.value || '+34'
    setDialCode(newDialCode)
    onChange(`${newDialCode} ${number}`.trim())
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value
    setNumber(newNumber)
    onChange(`${dialCode} ${newNumber}`.trim())
  }

  const errorClass = error ? 'border-red-500' : 'border-gray-300'

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="w-32">
          <Select
            value={selectedDialCode}
            onChange={handleDialCodeChange}
            options={dialCodeOptions}
            isSearchable
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: '42px',
                borderColor: error ? '#ef4444' : state.isFocused ? '#3e95b0' : '#d1d5db',
                boxShadow: state.isFocused ? '0 0 0 2px rgba(62, 149, 176, 0.2)' : 'none',
                '&:hover': {
                  borderColor: error ? '#ef4444' : '#3e95b0'
                }
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? '#f0f9fb' : state.isSelected ? '#3e95b0' : 'white',
                color: state.isSelected ? 'white' : '#1f2937',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }),
              singleValue: (base) => ({
                ...base,
                fontSize: '0.875rem'
              })
            }}
          />
        </div>
        <input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          placeholder="Phone number"
          required={required}
          className={`flex-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-omniwallet-primary focus:border-transparent ${errorClass}`}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}
