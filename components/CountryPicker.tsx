'use client'

import { useState, useRef, useEffect } from 'react'
import { COUNTRIES, Country } from '@/lib/countries'
import styles from './CountryPicker.module.css'

interface Props {
  value: Country
  onChange: (c: Country) => void
}

export default function CountryPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.includes(query)
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.open : ''}`}
        onClick={() => {
          setOpen((o) => !o)
          setQuery('')
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.flag}>{value.flag}</span>
        <span className={styles.code}>{value.code}</span>
        <svg className={styles.caret} width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.searchWrap}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search country..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <ul className={styles.list}>
            {filtered.length === 0 && (
              <li className={styles.empty}>No results</li>
            )}
            {filtered.map((c) => (
              <li
                key={c.iso}
                role="option"
                aria-selected={c.iso === value.iso}
                className={`${styles.option} ${c.iso === value.iso ? styles.selected : ''}`}
                onClick={() => {
                  onChange(c)
                  setOpen(false)
                  setQuery('')
                }}
              >
                <span className={styles.optFlag}>{c.flag}</span>
                <span className={styles.optName}>{c.name}</span>
                <span className={styles.optDial}>{c.code}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
