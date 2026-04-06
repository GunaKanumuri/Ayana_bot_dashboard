'use client'

import { useState } from 'react'
import styles from './OnboardModal.module.css'
import scheduleStyles from './Schedule.module.css'

export interface SlotConfig {
  enabled: boolean
  hour:    string   // "0"–"23"
  minute:  string   // "00"|"15"|"30"|"45"
}

export interface Step3Data {
  schedule: Record<string, SlotConfig>
}

interface Props {
  onBack: () => void
  onNext: (data: Step3Data) => void
}

const SLOTS = [
  { key: 'wake_up',         emoji: '🌅', label: 'Wake up',        defaultH: '6',  defaultM: '30', recommended: true  },
  { key: 'after_breakfast', emoji: '🍳', label: 'After breakfast', defaultH: '9',  defaultM: '00', recommended: true  },
  { key: 'afternoon',       emoji: '☀️', label: 'Afternoon',       defaultH: '13', defaultM: '00', recommended: false },
  { key: 'evening',         emoji: '🌆', label: 'Evening',         defaultH: '17', defaultM: '00', recommended: false },
  { key: 'night',           emoji: '🌙', label: 'Night',           defaultH: '20', defaultM: '00', recommended: false },
  { key: 'goodnight',       emoji: '😴', label: 'Goodnight',       defaultH: '22', defaultM: '00', recommended: true  },
]

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i))
const MINUTES = ['00', '15', '30', '45']

function fmt12(h: string, m: string) {
  const hr   = parseInt(h)
  const ampm = hr >= 12 ? 'PM' : 'AM'
  const disp = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
  return `${disp}:${m} ${ampm}`
}

function initSchedule(): Record<string, SlotConfig> {
  const s: Record<string, SlotConfig> = {}
  SLOTS.forEach(slot => {
    s[slot.key] = { enabled: slot.recommended, hour: slot.defaultH, minute: slot.defaultM }
  })
  return s
}

export default function Step3({ onBack, onNext }: Props) {
  const [schedule, setSchedule] = useState<Record<string, SlotConfig>>(initSchedule)

  const enabledCount = Object.values(schedule).filter(s => s.enabled).length

  function toggle(key: string, val: boolean) {
    setSchedule(prev => ({ ...prev, [key]: { ...prev[key], enabled: val } }))
  }
  function setHour(key: string, val: string) {
    setSchedule(prev => ({ ...prev, [key]: { ...prev[key], hour: val } }))
  }
  function setMinute(key: string, val: string) {
    setSchedule(prev => ({ ...prev, [key]: { ...prev[key], minute: val } }))
  }

  function handleNext() {
    onNext({ schedule })
  }

  return (
    <div className={styles.body}>
      <h2 className={styles.title}>Daily schedule</h2>
      <p className={styles.desc}>
        When should AYANA check in? Pick 2–4 times that fit their routine.
      </p>

      {/* Hint bar */}
      <div className={scheduleStyles.hint}>
        <span className={scheduleStyles.recBadge}>✓ Recommended</span> slots are pre-selected.
        Toggle any slot on or off and set the time to match your parent&apos;s actual day.
        {' '}<strong>{enabledCount} of 6 selected.</strong>
      </div>

      {/* 2-column grid of slots */}
      <div className={scheduleStyles.grid}>
        {SLOTS.map(slot => {
          const s = schedule[slot.key]
          return (
            <div key={slot.key} className={`${scheduleStyles.slot} ${s.enabled ? scheduleStyles.on : scheduleStyles.off}`}>
              {/* Top row: checkbox + emoji + label + rec badge */}
              <div className={scheduleStyles.slotTop}>
                <label className={scheduleStyles.toggleWrap}>
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={e => toggle(slot.key, e.target.checked)}
                  />
                  <span className={scheduleStyles.checkBox}/>
                </label>
                <span className={scheduleStyles.slotEmoji}>{slot.emoji}</span>
                <span className={scheduleStyles.slotLabel}>{slot.label}</span>
                {slot.recommended && <span className={scheduleStyles.recPill}>rec</span>}
              </div>

              {/* Time pickers — only when slot is enabled */}
              {s.enabled && (
                <div className={scheduleStyles.timePicker}>
                  <select
                    className={scheduleStyles.timeSelect}
                    value={s.hour}
                    onChange={e => setHour(slot.key, e.target.value)}
                    aria-label={`${slot.label} hour`}
                  >
                    {HOURS.map(h => (
                      <option key={h} value={h}>
                        {parseInt(h) === 0 ? '12 AM' : parseInt(h) < 12 ? `${h} AM` : parseInt(h) === 12 ? '12 PM' : `${parseInt(h) - 12} PM`}
                      </option>
                    ))}
                  </select>
                  <span className={scheduleStyles.colon}>:</span>
                  <select
                    className={scheduleStyles.timeSelect}
                    value={s.minute}
                    onChange={e => setMinute(slot.key, e.target.value)}
                    aria-label={`${slot.label} minute`}
                  >
                    {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <span className={scheduleStyles.preview}>{fmt12(s.hour, s.minute)}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.btnBack} onClick={onBack}>← Back</button>
        <button
          className={styles.btnNext}
          onClick={handleNext}
          disabled={enabledCount === 0}
        >
          Next — Routine & safety →
        </button>
      </div>
    </div>
  )
}