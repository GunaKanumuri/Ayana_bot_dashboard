'use client'

import PhoneInput, { defaultCountry } from '@/components/PhoneInput'
import { Country } from '@/lib/countries'
import { useState } from 'react'
import styles from './OnboardModal.module.css'

export interface Step2Data {
  parentName:     string
  nickname:       string
  parentCountry:  Country
  parentPhone:    string
  language:       string
  city:           string
}

interface Props {
  onBack: () => void
  onNext: (data: Step2Data) => void
}

const LANGUAGES = [
  { value: 'te', label: 'తెలుగు (Telugu)'     },
  { value: 'hi', label: 'हिन्दी (Hindi)'       },
  { value: 'ta', label: 'தமிழ் (Tamil)'       },
  { value: 'kn', label: 'ಕನ್ನಡ (Kannada)'     },
  { value: 'ml', label: 'മലയാളം (Malayalam)'  },
  { value: 'bn', label: 'বাংলা (Bengali)'     },
  { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)'    },
  { value: 'mr', label: 'मराठी (Marathi)'     },
  { value: 'gu', label: 'ગુજરાતી (Gujarati)'  },
  { value: 'or', label: 'ଓଡ଼ିଆ (Odia)'        },
  { value: 'en', label: 'English'              },
]

export default function Step2({ onBack, onNext }: Props) {
  const [parentName,    setParentName]    = useState('')
  const [nickname,      setNickname]      = useState('')
  const [parentCountry, setParentCountry] = useState<Country>(defaultCountry('IN'))
  const [parentPhone,   setParentPhone]   = useState('')
  const [language,      setLanguage]      = useState('te')
  const [city,          setCity]          = useState('')
  const [errors,        setErrors]        = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!parentName.trim()) e.parentName = "Please enter your parent's name"
    if (!nickname.trim())   e.nickname   = 'Please enter what you call them'
    if (!parentPhone.trim()) e.parentPhone = "Please enter your parent's WhatsApp number"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext({ parentName, nickname, parentCountry, parentPhone, language, city })
  }

  return (
    <div className={styles.body}>
      <h2 className={styles.title}>Parent profile</h2>
      <p className={styles.desc}>Tell us about the parent AYANA will check in with.</p>

      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label}>Parent&apos;s full name</label>
          <input
            type="text"
            className={`${styles.input} ${errors.parentName ? styles.inputError : ''}`}
            placeholder="e.g. Lakshmi Devi"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
          />
          {errors.parentName && <p className={styles.error}>{errors.parentName}</p>}
          <p className={styles.hint}>Used in health reports</p>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>What do you call them?</label>
          <input
            type="text"
            className={`${styles.input} ${errors.nickname ? styles.inputError : ''}`}
            placeholder="Amma, Nanna, Daddy..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          {errors.nickname && <p className={styles.error}>{errors.nickname}</p>}
          <p className={styles.hint}>Used in every voice message</p>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Parent&apos;s WhatsApp number</label>
        <PhoneInput
          country={parentCountry}
          onCountryChange={setParentCountry}
          phone={parentPhone}
          onPhoneChange={setParentPhone}
          placeholder="98765 43210"
        />
        {errors.parentPhone && <p className={styles.error}>{errors.parentPhone}</p>}
        <p className={styles.hint}>AYANA sends daily voice messages here — must be on WhatsApp</p>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label}>Their language</label>
          <select
            className={styles.select}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            City / location{' '}
            <span className={styles.optional}>(optional)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. Hyderabad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <p className={styles.hint}>Helps with location-aware emergencies</p>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnBack} onClick={onBack}>← Back</button>
        <button className={styles.btnNext} onClick={handleNext}>
          Next — Daily schedule →
        </button>
      </div>
    </div>
  )
}