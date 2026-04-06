'use client'

import PhoneInput, { defaultCountry } from '@/components/PhoneInput'
import { Country } from '@/lib/countries'
import { useState } from 'react'
import styles from './OnboardModal.module.css'

interface Props {
  onNext: (data: Step1Data) => void
}

export interface Step1Data {
  name: string
  country: Country
  phone: string
}

export default function Step1({ onNext }: Props) {
  const [name, setName] = useState('')
  const [country, setCountry] = useState<Country>(defaultCountry('US'))
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Please enter your full name'
    if (!phone.trim()) e.phone = 'Please enter your WhatsApp number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext({ name, country, phone })
  }

  return (
    <div className={styles.body}>
      <h2 className={styles.title}>Your details</h2>
      <p className={styles.desc}>Who should receive daily reports and emergency alerts?</p>

      <div className={styles.field}>
        <label className={styles.label}>Your full name</label>
        <input
          type="text"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="e.g. Guna Kanumuri"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className={styles.error}>{errors.name}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Your WhatsApp number</label>
        <PhoneInput
          country={country}
          onCountryChange={setCountry}
          phone={phone}
          onPhoneChange={setPhone}
          placeholder="98765 43210"
        />
        {errors.phone && <p className={styles.error}>{errors.phone}</p>}
        <p className={styles.hint}>You'll receive daily reports and emergency alerts here</p>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnNext} onClick={handleNext}>
          Next — Parent details →
        </button>
      </div>
    </div>
  )
}
