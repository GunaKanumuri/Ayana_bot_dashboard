'use client'

import PhoneInput, { defaultCountry } from '@/components/PhoneInput'
import { Country } from '@/lib/countries'
import { useState } from 'react'
import styles from './OnboardModal.module.css'

export interface Step4Data {
  routine:          string
  emergencyName:    string
  emergencyCountry: Country
  emergencyPhone:   string
}

interface Props {
  onBack:    () => void
  onSubmit:  (data: Step4Data) => void
  loading?:  boolean
}

export default function Step4({ onBack, onSubmit, loading }: Props) {
  const [routine,          setRoutine]          = useState('')
  const [emergencyName,    setEmergencyName]    = useState('')
  const [emergencyCountry, setEmergencyCountry] = useState<Country>(defaultCountry('IN'))
  const [emergencyPhone,   setEmergencyPhone]   = useState('')

  function handleSubmit() {
    onSubmit({ routine, emergencyName, emergencyCountry, emergencyPhone })
  }

  return (
    <div className={styles.body}>
      <h2 className={styles.title}>Routine &amp; safety</h2>
      <p className={styles.desc}>
        Help AYANA personalise check-ins and know who to call in emergencies.
      </p>

      <div className={styles.field}>
        <label className={styles.label}>
          Daily routine &amp; medicines{' '}
          <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          className={styles.textarea}
          placeholder="Wakes at 6am, BP tablet before tea, tiffin at 8:30, metformin after tiffin, lunch at 1pm, evening walk at 5, dinner at 8, atorvastatin at night..."
          value={routine}
          onChange={(e) => setRoutine(e.target.value)}
          rows={4}
        />
        <p className={styles.hint}>
          Describe naturally — AI extracts medicines, meal times, and activities automatically.
        </p>
      </div>

      <div className={styles.emergencyBox}>
        <div className={styles.emergencyHeader}>
          <span style={{ fontSize: '1.1rem' }}>🚨</span>
          <div>
            <p className={styles.emergencyTitle}>
              Emergency backup contact{' '}
              <span className={styles.emergencyOptional}>(optional but recommended)</span>
            </p>
            <p className={styles.emergencySub}>
              If AYANA detects an emergency and can&apos;t reach you, it contacts this person next —
              a sibling, relative, or trusted neighbour.
            </p>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} style={{ color: 'var(--emergency-title)' }}>
            Their name
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. Ravi (brother), Priya (sister)"
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
          />
        </div>

        <div className={styles.field} style={{ marginBottom: 0 }}>
          <label className={styles.label} style={{ color: 'var(--emergency-title)' }}>
            Their phone number
          </label>
          <PhoneInput
            country={emergencyCountry}
            onCountryChange={setEmergencyCountry}
            phone={emergencyPhone}
            onPhoneChange={setEmergencyPhone}
            placeholder="Phone or WhatsApp"
          />
          <p className={styles.hint}>Can be anywhere in the world</p>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnBack} onClick={onBack}>← Back</button>
        <button
          className={`${styles.btnNext} ${styles.btnCta}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Setting up...' : '⊕ Start free trial'}
        </button>
      </div>
      <p className={styles.ctaNote}>No credit card needed. Cancel anytime on WhatsApp.</p>
    </div>
  )
}