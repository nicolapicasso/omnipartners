'use client'

import Select from 'react-select'
import { countries, Country } from '@/lib/countries'

interface CountrySelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  className?: string
}

export default function CountrySelect({ value, onChange, error, required = false, className = '' }: CountrySelectProps) {
  const options = countries.map(country => ({
    value: country.name,
    label: country.name,
    code: country.code
  }))

  const selectedOption = options.find(opt => opt.value === value) || null

  return (
    <div className={className}>
      <Select
        value={selectedOption}
        onChange={(option) => onChange(option?.value || '')}
        options={options}
        placeholder="Search and select country..."
        isClearable
        isSearchable
        required={required}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base, state) => ({
            ...base,
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
            cursor: 'pointer'
          })
        }}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}
