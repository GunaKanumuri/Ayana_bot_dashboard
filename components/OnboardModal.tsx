'use client'

import { useState, useEffect, useRef } from 'react'
import Step1, { Step1Data } from './Step1'
import Step2, { Step2Data } from './Step2'
import Step3, { Step3Data } from './Step3'
import Step4, { Step4Data } from './Step4'
import styles from './Modal.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

const STEPS = ['Your details', 'Parent profile', 'Daily schedule', 'Routine & safety']

const WHATSAPP_BOT = process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || '14155238886'

export default function OnboardModal({ open, onClose }: Props) {
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [waLink, setWaLink]   = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setStep(1); setDone(false); setWaLink('')
      setStep1Data(null); setStep2Data(null); setStep3Data(null)
    }
  }, [open])

  useEffect(() => {
    modalRef.current?.scrollTo({ top: 0 })
  }, [step])

  async function handleSubmit(step4: Step4Data) {
    setLoading(true)

    // Build WhatsApp link using child name + parent nickname
    const childName     = step1Data?.name?.trim() || ''
    const parentNick    = step2Data?.nickname?.trim() || 'your parent'
    const link = `https://wa.me/${WHATSAPP_BOT}?text=${encodeURIComponent(
      `Hi AYANA, I just signed up! My name is ${childName}. Setting up care for ${parentNick}.`
    )}`
    setWaLink(link)

    try {
      await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...step1Data, ...step2Data, ...step3Data, ...step4 }),
      })
    } catch {
      // fail silently — show success anyway, WA link is the fallback
    } finally {
      setLoading(false)
      setDone(true)
    }
  }

  if (!open) return null

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} ref={modalRef}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {!done ? (
          <>
            {/* 4-step stepper */}
            <nav className={styles.stepper} aria-label="Onboarding steps">
              {STEPS.map((label, i) => {
                const n = i + 1
                const isDone   = n < step
                const isActive = n === step
                return (
                  <div key={n} className={styles.stepItem}>
                    <div className={`${styles.circle} ${isDone ? styles.done : isActive ? styles.active : styles.inactive}`}>
                      {isDone ? (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : n}
                    </div>
                    <span className={`${styles.stepLabel} ${isDone ? styles.labelDone : isActive ? styles.labelActive : styles.labelInactive}`}>
                      {label}
                    </span>
                    {n < STEPS.length && (
                      <div className={`${styles.line} ${isDone ? styles.lineDone : ''}`}/>
                    )}
                  </div>
                )
              })}
            </nav>

            {step === 1 && <Step1 onNext={(d) => { setStep1Data(d); setStep(2) }}/>}
            {step === 2 && <Step2 onBack={() => setStep(1)} onNext={(d) => { setStep2Data(d); setStep(3) }}/>}
            {step === 3 && <Step3 onBack={() => setStep(2)} onNext={(d) => { setStep3Data(d); setStep(4) }}/>}
            {step === 4 && <Step4 onBack={() => setStep(3)} onSubmit={handleSubmit} loading={loading}/>}
          </>
        ) : (
          /* ── Success screen ── */
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>
              {step2Data?.nickname || 'Your parent'} is all set!
            </h2>
            <p className={styles.successDesc}>
              AYANA is sending them a welcome message now.
              Open WhatsApp to confirm your setup and get started.
            </p>

            {/* Primary: open WhatsApp */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.successBtn}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.207l-.304-.18-2.867.852.852-2.867-.18-.304A8 8 0 1112 20z"/>
              </svg>
              Open WhatsApp to confirm
            </a>

            {/* Secondary: close */}
            <button
              className={styles.successClose}
              onClick={onClose}
            >
              Done, close this
            </button>

            <p className={styles.successNote}>
              No credit card needed · Cancel anytime on WhatsApp
            </p>
          </div>
        )}
      </div>
    </div>
  )
}