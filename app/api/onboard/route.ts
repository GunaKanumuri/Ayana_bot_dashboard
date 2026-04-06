import { NextRequest, NextResponse } from 'next/server'
import { SlotConfig } from '@/components/Step3'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      // Step 1
      name,
      country,
      phone,
      // Step 2
      parentName,
      nickname,
      parentCountry,
      parentPhone,
      language,
      city,
      // Step 3 — schedule
      schedule,
      // Step 4 — routine + emergency
      routine,
      emergencyName,
      emergencyCountry,
      emergencyPhone,
    } = body

    // ── Build payload for FastAPI ──────────────────────────────────────────────
    // Primary check-in time = first enabled slot (wake_up or after_breakfast)
    const SLOT_ORDER = ['wake_up','after_breakfast','afternoon','evening','night','goodnight']
    let checkin_time = '08:00'
    if (schedule) {
      for (const key of SLOT_ORDER) {
        const s: SlotConfig = schedule[key]
        if (s?.enabled) {
          const h = String(parseInt(s.hour)).padStart(2, '0')
          checkin_time = `${h}:${s.minute}`
          break
        }
      }
    }

    // Append schedule summary to routine so Gemini sees timing context
    const SLOT_LABELS: Record<string, string> = {
      wake_up: 'Wake up', after_breakfast: 'After breakfast',
      afternoon: 'Afternoon', evening: 'Evening',
      night: 'Night', goodnight: 'Goodnight',
    }
    const fmt12 = (h: string, m: string) => {
    const hr = parseInt(h)
    const ampm = hr >= 12 ? 'PM' : 'AM'
    const disp = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
    return `${disp}:${m} ${ampm}`
  }
    const scheduleSummary = schedule
      ? Object.entries(schedule as Record<string, SlotConfig>)
          .filter(([, s]) => s.enabled)
          .map(([key, s]) => `${SLOT_LABELS[key]}: ${fmt12(s.hour, s.minute)}`)
          .join(', ')
      : ''

    const routineFull = [
      routine?.trim(),
      city ? `Lives in ${city}.` : '',
      scheduleSummary ? `Check-in schedule: ${scheduleSummary}.` : '',
    ].filter(Boolean).join(' ')

    const fastApiPayload = {
      child_name:        name?.trim() ?? '',
      child_phone:       `${country?.code ?? ''}${phone ?? ''}`,
      parent_name:       parentName?.trim() ?? '',
      parent_nickname:   nickname?.trim() ?? '',
      parent_phone:      `${parentCountry?.code ?? ''}${parentPhone ?? ''}`,
      language:          language ?? 'te',
      checkin_time,
      routine:           routineFull,
      emergency_contact: emergencyPhone ? `${emergencyCountry?.code ?? ''}${emergencyPhone}` : '',
    }

    // ── Forward to Railway FastAPI ─────────────────────────────────────────────
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) {
      console.error('[onboard] NEXT_PUBLIC_BACKEND_URL not set')
      return NextResponse.json(
        { success: false, error: 'Backend not configured' },
        { status: 503 }
      )
    }

    const resp = await fetch(`${backendUrl}/child/onboard`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(fastApiPayload),
    })

    let data: unknown
    try { data = await resp.json() } catch { data = {} }

    if (resp.ok) {
      console.log('[onboard] success:', fastApiPayload.child_phone, '→', fastApiPayload.parent_nickname)
      return NextResponse.json({ success: true, ...( typeof data === 'object' ? data : {}) })
    }

    console.error('[onboard] FastAPI error:', resp.status, data)
    return NextResponse.json(
      { success: false, error: 'Backend error', detail: data },
      { status: resp.status }
    )

  } catch (err) {
    console.error('[onboard error]', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}