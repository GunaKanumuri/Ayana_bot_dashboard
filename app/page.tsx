'use client'

import { useState } from 'react'
import OnboardModal from '@/components/OnboardModal'
import styles from './page.module.css'

const WAVE_HEIGHTS = [4, 8, 12, 16, 20, 14, 10, 18, 22, 16, 10, 6, 14, 20, 12, 8]

const FEATURES = [
  { icon: '🎙️', title: 'Voice messages in their language', desc: 'Telugu, Hindi, Tamil, Kannada, Malayalam — 11 languages in native script. Never romanised.' },
  { icon: '👆', title: 'Emoji buttons they can tap', desc: '😊 Good, 🤒 Okay, 😔 Not well. One tap is all it takes. No reading or typing required.' },
  { icon: '💊', title: 'Medicine reminders that fit their routine', desc: 'Morning BP tablet before tea, metformin after tiffin — AYANA learns their exact schedule.' },
  { icon: '🚨', title: 'Instant emergency alerts', desc: "If your parent signals distress or stops responding, you're alerted immediately — no confirmation delay." },
  { icon: '📊', title: 'Weekly health digest', desc: 'Every Sunday, a full summary of mood trends, medicine compliance, and anything flagged that week.' },
  { icon: '🔒', title: 'Works on WhatsApp they already use', desc: "No new app. No login. No password. Just WhatsApp — which your parent already knows." },
]

const LANGUAGES = [
  { label: 'తెలుగు', native: true },
  { label: 'हिन्दी', native: true },
  { label: 'தமிழ்', native: true },
  { label: 'ಕನ್ನಡ', native: true },
  { label: 'മലയാളം', native: true },
  { label: 'বাংলা', native: true },
  { label: 'ਪੰਜਾਬੀ', native: true },
  { label: 'मराठी', native: true },
  { label: 'ગુજરાતી', native: true },
  { label: 'ଓଡ଼ିଆ', native: true },
  { label: 'English', native: false },
]

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.logo}>ayana<span>.</span></div>
        <div className={styles.navLinks}>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <button className={styles.btnPrimary} onClick={() => setModalOpen(true)}>
            <span>⊕</span> Start free trial
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.heroSection}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              Available in Telugu, Hindi, Tamil + 8 more languages
            </div>
            <h1 className={styles.h1}>
              Know your parents<br />are okay,<br />
              <em>every single day</em>
            </h1>
            <p className={styles.heroSub}>
              <strong>Built for NRI families who worry about parents back home.</strong>{' '}
              AYANA sends a warm voice message to your parents each morning on WhatsApp — in their language. They tap a button. You get a daily health report. No app needed.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.btnHero} onClick={() => setModalOpen(true)}>
                <span>⊕</span> Start 14-day free trial
              </button>
              <a href="#how-it-works" className={styles.btnGhost}>
                See how it works ↓
              </a>
            </div>
            <div className={styles.trustLine}>
              <div className={styles.avatars}>
                <div className={`${styles.avatar} ${styles.a1}`}>S</div>
                <div className={`${styles.avatar} ${styles.a2}`}>R</div>
                <div className={`${styles.avatar} ${styles.a3}`}>P</div>
                <div className={`${styles.avatar} ${styles.a4}`}>A</div>
              </div>
              <span>Trusted by NRI families in 12 countries</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className={styles.phoneWrap}>
            <div className={styles.phone}>
              <div className={styles.phoneScreen}>
                <div className={styles.phoneHeader}>
                  <div className={styles.phoneAvatar}>A</div>
                  <div>
                    <div className={styles.phoneName}>AYANA Care</div>
                    <div className={styles.phoneStatus}>online</div>
                  </div>
                </div>
                <div className={styles.phoneBody}>
                  {/* Audio bubble */}
                  <div className={styles.audioBubble}>
                    <div className={styles.playBtn}>
                      <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
                        <path d="M0 0l10 6-10 6z" />
                      </svg>
                    </div>
                    <div className={styles.waveform}>
                      {WAVE_HEIGHTS.map((h, i) => (
                        <div key={i} className={styles.waveBar} style={{ height: h }} />
                      ))}
                    </div>
                    <span className={styles.waveDur}>0:08</span>
                  </div>
                  {/* Check-in message */}
                  <div className={styles.bubbleIn}>
                    <p>గుడ్ మార్నింగ్ బుజ్జమ్మ! ఎలా ఉన్నారు?</p>
                    <div className={styles.bubbleBtns}>
                      <div className={styles.bubbleBtn}>1 😊 బాగున్నాను</div>
                      <div className={styles.bubbleBtn}>2 🤒 సరే</div>
                      <div className={styles.bubbleBtn}>3 😔 బాగాలేదండి</div>
                    </div>
                    <div className={styles.time}>8:00 AM</div>
                  </div>
                  <div className={styles.bubbleOut}>
                    <p>1</p>
                    <div className={styles.time}>8:02 AM ✓✓</div>
                  </div>
                  <div className={styles.bubbleIn}>
                    <p>మార్నింగ్ BP టాబ్లెట్ వేసుకున్నావా?</p>
                    <div className={styles.bubbleBtns}>
                      <div className={styles.bubbleBtn}>1 ✅ తీసుకున్నాను</div>
                      <div className={styles.bubbleBtn}>2 ❌ ఇంకా లేదు</div>
                    </div>
                    <div className={styles.time}>8:02 AM</div>
                  </div>
                  <div className={styles.bubbleOut}>
                    <p>1</p>
                    <div className={styles.time}>8:03 AM ✓✓</div>
                  </div>
                  <div className={styles.bubbleIn}>
                    <p>బాగుంది! టిఫిన్ తిని మిగతా మాత్రలు వేసుకో, జాగ్రత్త! 🙏</p>
                    <div className={styles.time}>8:03 AM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* HOW IT WORKS */}
      <section id="how-it-works" className={styles.section}>
        <p className={styles.sectionLabel}>How it works</p>
        <h2 className={styles.sectionTitle}>Three steps to peace of mind</h2>
        <p className={styles.sectionSub}>Takes 2 minutes to set up. Works every day after that.</p>
        <div className={styles.stepsGrid}>
          {[
            { num: '01', icon: '📝', title: 'Tell us about your parent', desc: "Their name, nickname, language, daily routine, and medicines. Describe naturally — our AI organises everything.", badge: 'Takes 2 minutes' },
            { num: '02', icon: '🎙️', title: 'Parent hears a warm voice', desc: 'Every morning, your parent gets an audio message in their language asking how they are. They tap one button. Zero typing needed.', badge: 'Happens automatically' },
            { num: '03', icon: '📊', title: 'You get daily peace of mind', desc: 'Every evening, you receive a summary: mood, medicines, concerns. If anything is wrong, you know immediately.', badge: 'Every day at 8 PM' },
          ].map((s) => (
            <div key={s.num} className={styles.stepCard}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
              <span className={styles.stepBadge}>{s.badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PARENT EXPERIENCE */}
      <section className={styles.darkSection}>
        <div className={styles.darkInner}>
          <p className={`${styles.sectionLabel} ${styles.labelLight}`}>What your parent experiences</p>
          <h2 className={`${styles.sectionTitle} ${styles.titleLight}`}>
            They hear a voice.<br />They tap a button.<br />
            <em className={styles.greenItalic}>That's it.</em>
          </h2>
          <p className={`${styles.sectionSub} ${styles.subLight}`}>
            Designed for parents who don't type, don't read instructions, and don't download apps.
          </p>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featCard}>
                <div className={styles.featIcon}>{f.icon}</div>
                <h3 className={styles.featTitle}>{f.title}</h3>
                <p className={styles.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LANGUAGES */}
      <section className={styles.langSection}>
        <div className={styles.langInner}>
          <p className={styles.sectionLabel}>Languages</p>
          <h2 className={styles.sectionTitle}>In their mother tongue,<br />not yours</h2>
          <p className={styles.sectionSub}>
            Every message is sent in your parent's native script — not transliterated, not romanised.
          </p>
          <div className={styles.langPills}>
            {LANGUAGES.map((l) => (
              <span key={l.label} className={`${styles.langPill} ${l.native ? styles.langPillNative : ''}`}>
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Start knowing your parents are okay</h2>
        <p className={styles.ctaSub}>14-day free trial. No credit card needed. Cancel anytime on WhatsApp.</p>
        <button className={styles.btnHero} onClick={() => setModalOpen(true)}>
          <span>⊕</span> Start free trial
        </button>
      </section>

      <OnboardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
