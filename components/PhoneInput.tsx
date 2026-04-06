'use client'

import CountryPicker from './CountryPicker'
import { Country } from '@/lib/countries'
import styles from './PhoneInput.module.css'

interface Props {
  country: Country
  onCountryChange: (c: Country) => void
  phone: string
  onPhoneChange: (v: string) => void
  placeholder?: string
}

export default function PhoneInput({
  country,
  onCountryChange,
  phone,
  onPhoneChange,
  placeholder = '98765 43210',
}: Props) {
  // Strip all non-digit characters — prevents letters being typed
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPhoneChange(e.target.value.replace(/\D/g, ''))
  }

  return (
    <div className={styles.wrap}>
      <CountryPicker value={country} onChange={onCountryChange} />
      <input
        type="tel"
        className={styles.input}
        value={phone}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="tel-national"
      />
    </div>
  )
}

export function defaultCountry(iso: string): Country {
  const { COUNTRIES } = require('@/lib/countries')
  return COUNTRIES.find((c: Country) => c.iso === iso) ?? COUNTRIES[0]
}