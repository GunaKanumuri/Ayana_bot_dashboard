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

export default function OnboardModal({ open, onClose }: Props) {
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
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
      setStep(1); setDone(false)
      setStep1Data(null); setStep2Data(null); setStep3Data(null)
    }
  }, [open])

  useEffect(() => {
    modalRef.current?.scrollTo({ top: 0 })
  }, [step])

  async function handleSubmit(step4: Step4Data) {
    setLoading(true)
    try {
      await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...step1Data, ...step2Data, ...step3Data, ...step4 }),
      })
      setDone(true)
    } catch {
      setDone(true)
    } finally {
      setLoading(false)
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
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>You&apos;re all set!</h2>
            <p className={styles.successDesc}>
              AYANA will start checking in with your parent today. You&apos;ll get a WhatsApp confirmation shortly.
            </p>
            <button className={styles.successBtn} onClick={onClose}>
              Got it, thanks →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}