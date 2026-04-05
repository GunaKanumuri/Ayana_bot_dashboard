/**
 * AYANA — Landing Page
 * Route: / (pages/index.jsx)
 *
 * Onboarding modal — 3 steps:
 *   Step 1: Your details (name + phone with country code)
 *   Step 2: Parent details (nickname, full name, phone, language, check-in time, city)
 *   Step 3: Routine & emergency (routine textarea + emergency contact)
 *
 * Posts to BACKEND_URL/child/onboard → shows success screen
 */

import { useState, useEffect, useRef } from "react";
import Head from "next/head";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const WHATSAPP_BOT_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "14155238886";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const COUNTRY_CODES = [
  { code:"IN", dial:"+91",  flag:"🇮🇳", name:"India" },
  { code:"US", dial:"+1",   flag:"🇺🇸", name:"United States" },
  { code:"GB", dial:"+44",  flag:"🇬🇧", name:"United Kingdom" },
  { code:"AE", dial:"+971", flag:"🇦🇪", name:"UAE" },
  { code:"CA", dial:"+1",   flag:"🇨🇦", name:"Canada" },
  { code:"AU", dial:"+61",  flag:"🇦🇺", name:"Australia" },
  { code:"SG", dial:"+65",  flag:"🇸🇬", name:"Singapore" },
  { code:"NZ", dial:"+64",  flag:"🇳🇿", name:"New Zealand" },
  { code:"DE", dial:"+49",  flag:"🇩🇪", name:"Germany" },
  { code:"NL", dial:"+31",  flag:"🇳🇱", name:"Netherlands" },
  { code:"AF", dial:"+93",  flag:"🇦🇫", name:"Afghanistan" },
  { code:"AL", dial:"+355", flag:"🇦🇱", name:"Albania" },
  { code:"DZ", dial:"+213", flag:"🇩🇿", name:"Algeria" },
  { code:"AD", dial:"+376", flag:"🇦🇩", name:"Andorra" },
  { code:"AO", dial:"+244", flag:"🇦🇴", name:"Angola" },
  { code:"AR", dial:"+54",  flag:"🇦🇷", name:"Argentina" },
  { code:"AM", dial:"+374", flag:"🇦🇲", name:"Armenia" },
  { code:"AT", dial:"+43",  flag:"🇦🇹", name:"Austria" },
  { code:"AZ", dial:"+994", flag:"🇦🇿", name:"Azerbaijan" },
  { code:"BH", dial:"+973", flag:"🇧🇭", name:"Bahrain" },
  { code:"BD", dial:"+880", flag:"🇧🇩", name:"Bangladesh" },
  { code:"BY", dial:"+375", flag:"🇧🇾", name:"Belarus" },
  { code:"BE", dial:"+32",  flag:"🇧🇪", name:"Belgium" },
  { code:"BT", dial:"+975", flag:"🇧🇹", name:"Bhutan" },
  { code:"BO", dial:"+591", flag:"🇧🇴", name:"Bolivia" },
  { code:"BA", dial:"+387", flag:"🇧🇦", name:"Bosnia" },
  { code:"BR", dial:"+55",  flag:"🇧🇷", name:"Brazil" },
  { code:"BN", dial:"+673", flag:"🇧🇳", name:"Brunei" },
  { code:"BG", dial:"+359", flag:"🇧🇬", name:"Bulgaria" },
  { code:"KH", dial:"+855", flag:"🇰🇭", name:"Cambodia" },
  { code:"CM", dial:"+237", flag:"🇨🇲", name:"Cameroon" },
  { code:"CL", dial:"+56",  flag:"🇨🇱", name:"Chile" },
  { code:"CN", dial:"+86",  flag:"🇨🇳", name:"China" },
  { code:"CO", dial:"+57",  flag:"🇨🇴", name:"Colombia" },
  { code:"CR", dial:"+506", flag:"🇨🇷", name:"Costa Rica" },
  { code:"HR", dial:"+385", flag:"🇭🇷", name:"Croatia" },
  { code:"CU", dial:"+53",  flag:"🇨🇺", name:"Cuba" },
  { code:"CY", dial:"+357", flag:"🇨🇾", name:"Cyprus" },
  { code:"CZ", dial:"+420", flag:"🇨🇿", name:"Czech Republic" },
  { code:"DK", dial:"+45",  flag:"🇩🇰", name:"Denmark" },
  { code:"DO", dial:"+1",   flag:"🇩🇴", name:"Dominican Republic" },
  { code:"EC", dial:"+593", flag:"🇪🇨", name:"Ecuador" },
  { code:"EG", dial:"+20",  flag:"🇪🇬", name:"Egypt" },
  { code:"SV", dial:"+503", flag:"🇸🇻", name:"El Salvador" },
  { code:"EE", dial:"+372", flag:"🇪🇪", name:"Estonia" },
  { code:"ET", dial:"+251", flag:"🇪🇹", name:"Ethiopia" },
  { code:"FI", dial:"+358", flag:"🇫🇮", name:"Finland" },
  { code:"FR", dial:"+33",  flag:"🇫🇷", name:"France" },
  { code:"GE", dial:"+995", flag:"🇬🇪", name:"Georgia" },
  { code:"GH", dial:"+233", flag:"🇬🇭", name:"Ghana" },
  { code:"GR", dial:"+30",  flag:"🇬🇷", name:"Greece" },
  { code:"GT", dial:"+502", flag:"🇬🇹", name:"Guatemala" },
  { code:"HK", dial:"+852", flag:"🇭🇰", name:"Hong Kong" },
  { code:"HU", dial:"+36",  flag:"🇭🇺", name:"Hungary" },
  { code:"IS", dial:"+354", flag:"🇮🇸", name:"Iceland" },
  { code:"ID", dial:"+62",  flag:"🇮🇩", name:"Indonesia" },
  { code:"IR", dial:"+98",  flag:"🇮🇷", name:"Iran" },
  { code:"IQ", dial:"+964", flag:"🇮🇶", name:"Iraq" },
  { code:"IE", dial:"+353", flag:"🇮🇪", name:"Ireland" },
  { code:"IL", dial:"+972", flag:"🇮🇱", name:"Israel" },
  { code:"IT", dial:"+39",  flag:"🇮🇹", name:"Italy" },
  { code:"JP", dial:"+81",  flag:"🇯🇵", name:"Japan" },
  { code:"JO", dial:"+962", flag:"🇯🇴", name:"Jordan" },
  { code:"KZ", dial:"+7",   flag:"🇰🇿", name:"Kazakhstan" },
  { code:"KE", dial:"+254", flag:"🇰🇪", name:"Kenya" },
  { code:"KW", dial:"+965", flag:"🇰🇼", name:"Kuwait" },
  { code:"LV", dial:"+371", flag:"🇱🇻", name:"Latvia" },
  { code:"LB", dial:"+961", flag:"🇱🇧", name:"Lebanon" },
  { code:"LT", dial:"+370", flag:"🇱🇹", name:"Lithuania" },
  { code:"LU", dial:"+352", flag:"🇱🇺", name:"Luxembourg" },
  { code:"MY", dial:"+60",  flag:"🇲🇾", name:"Malaysia" },
  { code:"MV", dial:"+960", flag:"🇲🇻", name:"Maldives" },
  { code:"MT", dial:"+356", flag:"🇲🇹", name:"Malta" },
  { code:"MU", dial:"+230", flag:"🇲🇺", name:"Mauritius" },
  { code:"MX", dial:"+52",  flag:"🇲🇽", name:"Mexico" },
  { code:"MD", dial:"+373", flag:"🇲🇩", name:"Moldova" },
  { code:"MN", dial:"+976", flag:"🇲🇳", name:"Mongolia" },
  { code:"MA", dial:"+212", flag:"🇲🇦", name:"Morocco" },
  { code:"MM", dial:"+95",  flag:"🇲🇲", name:"Myanmar" },
  { code:"NA", dial:"+264", flag:"🇳🇦", name:"Namibia" },
  { code:"NP", dial:"+977", flag:"🇳🇵", name:"Nepal" },
  { code:"NG", dial:"+234", flag:"🇳🇬", name:"Nigeria" },
  { code:"NO", dial:"+47",  flag:"🇳🇴", name:"Norway" },
  { code:"OM", dial:"+968", flag:"🇴🇲", name:"Oman" },
  { code:"PK", dial:"+92",  flag:"🇵🇰", name:"Pakistan" },
  { code:"PA", dial:"+507", flag:"🇵🇦", name:"Panama" },
  { code:"PY", dial:"+595", flag:"🇵🇾", name:"Paraguay" },
  { code:"PE", dial:"+51",  flag:"🇵🇪", name:"Peru" },
  { code:"PH", dial:"+63",  flag:"🇵🇭", name:"Philippines" },
  { code:"PL", dial:"+48",  flag:"🇵🇱", name:"Poland" },
  { code:"PT", dial:"+351", flag:"🇵🇹", name:"Portugal" },
  { code:"QA", dial:"+974", flag:"🇶🇦", name:"Qatar" },
  { code:"RO", dial:"+40",  flag:"🇷🇴", name:"Romania" },
  { code:"RU", dial:"+7",   flag:"🇷🇺", name:"Russia" },
  { code:"RW", dial:"+250", flag:"🇷🇼", name:"Rwanda" },
  { code:"SA", dial:"+966", flag:"🇸🇦", name:"Saudi Arabia" },
  { code:"SN", dial:"+221", flag:"🇸🇳", name:"Senegal" },
  { code:"RS", dial:"+381", flag:"🇷🇸", name:"Serbia" },
  { code:"SK", dial:"+421", flag:"🇸🇰", name:"Slovakia" },
  { code:"SI", dial:"+386", flag:"🇸🇮", name:"Slovenia" },
  { code:"ZA", dial:"+27",  flag:"🇿🇦", name:"South Africa" },
  { code:"KR", dial:"+82",  flag:"🇰🇷", name:"South Korea" },
  { code:"ES", dial:"+34",  flag:"🇪🇸", name:"Spain" },
  { code:"LK", dial:"+94",  flag:"🇱🇰", name:"Sri Lanka" },
  { code:"SE", dial:"+46",  flag:"🇸🇪", name:"Sweden" },
  { code:"CH", dial:"+41",  flag:"🇨🇭", name:"Switzerland" },
  { code:"TW", dial:"+886", flag:"🇹🇼", name:"Taiwan" },
  { code:"TZ", dial:"+255", flag:"🇹🇿", name:"Tanzania" },
  { code:"TH", dial:"+66",  flag:"🇹🇭", name:"Thailand" },
  { code:"TN", dial:"+216", flag:"🇹🇳", name:"Tunisia" },
  { code:"TR", dial:"+90",  flag:"🇹🇷", name:"Turkey" },
  { code:"UG", dial:"+256", flag:"🇺🇬", name:"Uganda" },
  { code:"UA", dial:"+380", flag:"🇺🇦", name:"Ukraine" },
  { code:"UY", dial:"+598", flag:"🇺🇾", name:"Uruguay" },
  { code:"UZ", dial:"+998", flag:"🇺🇿", name:"Uzbekistan" },
  { code:"VE", dial:"+58",  flag:"🇻🇪", name:"Venezuela" },
  { code:"VN", dial:"+84",  flag:"🇻🇳", name:"Vietnam" },
  { code:"YE", dial:"+967", flag:"🇾🇪", name:"Yemen" },
  { code:"ZM", dial:"+260", flag:"🇿🇲", name:"Zambia" },
  { code:"ZW", dial:"+263", flag:"🇿🇼", name:"Zimbabwe" },
];

const LANGUAGES = [
  { code:"te", label:"తెలుగు",  en:"Telugu"    },
  { code:"hi", label:"हिन्दी",   en:"Hindi"     },
  { code:"ta", label:"தமிழ்",   en:"Tamil"     },
  { code:"kn", label:"ಕನ್ನಡ",   en:"Kannada"   },
  { code:"ml", label:"മലയാളം",  en:"Malayalam" },
  { code:"bn", label:"বাংলা",   en:"Bengali"   },
  { code:"mr", label:"मराठी",   en:"Marathi"   },
  { code:"gu", label:"ગુજરાતી", en:"Gujarati"  },
  { code:"pa", label:"ਪੰਜਾਬੀ",  en:"Punjabi"   },
  { code:"od", label:"ଓଡ଼ିଆ",   en:"Odia"      },
  { code:"en", label:"English", en:"English"   },
];

const CHECKIN_TIMES = ["06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00"];

const STEPS = [
  { n:1, label:"Your details"    },
  { n:2, label:"Parent profile"  },
  { n:3, label:"Routine & safety"},
];

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════════

const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.207l-.304-.18-2.867.852.852-2.867-.18-.304A8 8 0 1112 20z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PHONE INPUT — country code picker + number field
// ═══════════════════════════════════════════════════════════════════════════════

function PhoneInput({ label, hint, dialCode, onDialChange, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropRef = useRef(null);

  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  );
  const selected = COUNTRY_CODES.find(c => c.dial === dialCode) || COUNTRY_CODES[0];

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="phone-row" ref={dropRef}>
        <button type="button" className="dial-btn" onClick={() => setOpen(!open)}>
          <span>{selected.flag}</span>
          <span>{selected.dial}</span>
          <span className="dial-arrow">▾</span>
        </button>
        <input
          type="tel"
          placeholder={placeholder || "98765 43210"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="phone-num-input"
        />
        {open && (
          <div className="country-drop">
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="country-search"
              autoFocus
            />
            <div className="country-list">
              {filtered.map((c) => (
                <div
                  key={c.code}
                  className={`country-item ${c.dial === dialCode ? "active" : ""}`}
                  onClick={() => { onDialChange(c.dial); setOpen(false); setSearch(""); }}
                >
                  <span>{c.flag}</span>
                  <span className="country-name">{c.name}</span>
                  <span className="country-dial">{c.dial}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════

function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {STEPS.map((s, i) => (
        <div key={s.n} className="step-item">
          <div className={`step-bubble ${current === s.n ? "active" : current > s.n ? "done" : ""}`}>
            {current > s.n ? <CheckIcon /> : s.n}
          </div>
          <div className={`step-label ${current === s.n ? "active" : ""}`}>{s.label}</div>
          {i < STEPS.length - 1 && <div className={`step-line ${current > s.n ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const openModal = (e) => { e?.preventDefault(); setModalOpen(true); document.body.style.overflow = "hidden"; };
  const closeModal = () => { setModalOpen(false); document.body.style.overflow = ""; };

  return (
    <>
      <Head>
        <title>AYANA — Know your parents are okay, every day</title>
        <meta name="description" content="A voice-first WhatsApp companion that checks on your elderly parents daily in their language. You get peace of mind. They feel loved." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{globalStyles}</style>

      <nav className={navScrolled ? "scrolled" : ""}>
        <div className="nav-inner">
          <a href="#" className="logo">ayana<span>.</span></a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <button className="nav-cta" onClick={openModal}><WhatsAppIcon size={16} /> Start free trial</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge"><span className="pulse-dot" /> Available in Telugu, Hindi, Tamil + 8 more</div>
              <h1>Know your parents are okay, <em>every single day</em></h1>
              <p className="hero-sub">AYANA sends a warm voice message to your parents each morning on WhatsApp — in their language. They tap a button. You get a daily health report. No app needed.</p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={openModal}><WhatsAppIcon /> Start 14-day free trial</button>
                <a href="#how" className="btn-ghost">See how it works <ArrowDown /></a>
              </div>
              <div className="hero-proof">
                <div className="proof-faces">
                  {["S","R","P","A"].map((l,i) => <div key={i} className={`proof-face f${i+1}`}>{l}</div>)}
                </div>
                <div className="proof-text">Built for <strong>NRI families</strong> who worry about parents back home</div>
              </div>
            </div>
            <div className="hero-visual"><PhoneMockup /></div>
          </div>
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="container">
          <div className="section-eyebrow reveal">How it works</div>
          <div className="section-heading reveal">Set up in 2 minutes. Peace of mind forever.</div>
          <p className="section-desc reveal">No app to install, no accounts to create. Just WhatsApp — the app your parents already use every day.</p>
          <div className="steps-grid">
            {[
              {icon:"📝",iconCls:"green",title:"Tell us about your parent",desc:"Their name, nickname, language, daily routine, and medicines. Describe it naturally — our AI organizes everything.",time:"Takes 2 minutes"},
              {icon:"🎙️",iconCls:"amber",title:"Parent hears a warm voice",desc:"Every morning, your parent gets an audio message in their language asking how they are. They tap one button. Zero typing needed.",time:"Happens automatically"},
              {icon:"📊",iconCls:"teal",title:"You get daily peace of mind",desc:"Every evening, you receive a summary: mood, medicines, concerns. If anything is wrong, you know immediately.",time:"Every day at 8 PM"},
            ].map((s,i) => (
              <div className="step-card reveal" key={i}>
                <div className={`step-icon ${s.iconCls}`}>{s.icon}</div>
                <h3>{s.title}</h3><p>{s.desc}</p>
                <span className="step-time">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="experience-section">
        <div className="container">
          <div className="section-eyebrow reveal">What your parent experiences</div>
          <div className="section-heading reveal">They hear a voice. They tap a button. That&apos;s it.</div>
          <p className="section-desc reveal">Designed for parents who don&apos;t type, don&apos;t read instructions, and don&apos;t download apps.</p>
          <div className="exp-grid">
            {[
              {icon:"🎙️",title:"Voice messages in their language",desc:"Telugu, Hindi, Tamil, Kannada, Malayalam — 11 Indian languages. They hear it, they don't read it."},
              {icon:"👆",title:"Emoji buttons they can tap",desc:"😊 Good, 😐 Okay, 😔 Not well. One tap = check-in done. No keyboard ever."},
              {icon:"💊",title:"Medicine reminders that fit their routine",desc:"\"Gas tablet before tea, BP tablet after tiffin.\" Grouped by meals, not timestamps."},
              {icon:"🚨",title:"One-tap emergency alert",desc:"One tap and you get a phone call immediately. Retries if you don't answer. Calls your backup contact."},
              {icon:"🧠",title:"It remembers and adapts",desc:"If your mom mentioned knee pain yesterday, today it asks \"How is the knee?\" Not \"How are you?\""},
              {icon:"🌙",title:"Good night with your name",desc:"\"Good night Bujjamma! Guna misses you.\" The last thing she hears before sleep is warmth from you."},
            ].map((c,i) => (
              <div className="exp-card reveal" key={i}>
                <span className="exp-icon">{c.icon}</span>
                <h3>{c.title}</h3><p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-eyebrow reveal">Pricing</div>
          <div className="section-heading reveal" style={{textAlign:"center"}}>Less than one Swiggy order per month</div>
          <div className="price-card reveal">
            <div className="price-gradient-bar" />
            <span className="price-tag">14-DAY FREE TRIAL</span>
            <div className="price-amount"><span className="currency">₹</span>199<span className="period"> / month</span></div>
            <div className="price-scope">per family, up to 2 parents</div>
            <div className="price-list">
              {["Daily voice check-ins in their language","Medicine reminders (grouped by routine)","Emergency one-tap alert with auto-call","Daily + weekly health reports","Context-aware health tracking","Add siblings free (shared reports)","14-day free trial, cancel anytime"].map((item,i) => (
                <div className="price-item" key={i}><span className="check"><CheckIcon /></span>{item}</div>
              ))}
            </div>
            <button className="price-cta" onClick={openModal}>Start 14-day free trial</button>
            <p className="price-nri">Living abroad? $4.99/month (USD) — same features.</p>
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="container">
          <div className="section-eyebrow reveal">Questions</div>
          <div className="section-heading reveal">Everything you want to know</div>
          <div className="faq-list">
            {[
              {q:"Will my parent need to type anything?",a:"No, never. Every interaction is either tapping an emoji button or sending a voice note. Your parent never opens a keyboard."},
              {q:"What languages are supported?",a:"11 Indian languages including Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, and English."},
              {q:"What if my parent doesn't respond?",a:"AYANA sends one gentle reminder after 3 hours. If still no response after 6 hours, you get an alert. No spam."},
              {q:"Can I manage both my parents?",a:"Yes! Each parent gets their own separate conversation with AYANA, tailored to their routine. You get a combined daily report."},
              {q:"How does the emergency alert work?",a:"If your parent taps the emergency button or AYANA detects severe distress in their voice note, the system calls you immediately."},
              {q:"Is my parent's data safe?",a:"All messages go through WhatsApp's end-to-end encryption. We never sell data or share with third parties."},
              {q:"Can my sibling also receive reports?",a:"Yes, free of charge. Add their WhatsApp number and they'll receive the same daily reports."},
            ].map((faq,i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      <section className="final-cta-section">
        <div className="container" style={{textAlign:"center"}}>
          <div className="section-heading reveal" style={{color:"white",maxWidth:540,margin:"0 auto"}}>Your parent&apos;s first check-in is minutes away</div>
          <p className="reveal" style={{color:"rgba(255,255,255,0.65)",maxWidth:420,margin:"16px auto 32px",fontSize:16,lineHeight:1.7}}>Set up takes 2 minutes. No credit card. Your parent gets their first voice message today.</p>
          <button className="btn-primary reveal" onClick={openModal} style={{fontSize:18,padding:"18px 44px"}}><WhatsAppIcon size={22} /> Start free trial</button>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-inner">
            <a href="#" className="footer-logo">ayana<span>.</span></a>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
              <a href={`https://wa.me/${WHATSAPP_BOT_NUMBER}`}>Contact on WhatsApp</a>
            </div>
          </div>
          <div className="footer-note">Made with love for Indian families, from Hyderabad.</div>
        </div>
      </footer>

      {modalOpen && <OnboardingModal onClose={closeModal} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHONE MOCKUP
// ═══════════════════════════════════════════════════════════════════════════════

function PhoneMockup() {
  return (
    <div className="phone-frame">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="wa-header">
          <div className="wa-avatar">A</div>
          <div><div className="wa-name">AYANA Care</div><div className="wa-status">online</div></div>
        </div>
        <div className="chat-area">
          <div className="voice-msg">
            <div className="voice-play" />
            <div className="voice-waves">{[6,14,10,18,8,12,16,6].map((h,i) => <span key={i} style={{height:h}} />)}</div>
            <span className="voice-dur">0:08</span>
          </div>
          <div className="bubble bot">
            <div>గుడ్ మార్నింగ్ బుజ్జమ్మ! ఎలా ఉన్నారు?</div>
            <div className="quick-replies">
              <div className="qr">1️⃣ 😊 బాగున్నాను</div>
              <div className="qr">2️⃣ 😐 సరే</div>
              <div className="qr">3️⃣ 😔 బాగాలేదండి</div>
            </div>
            <div className="time">8:00 AM</div>
          </div>
          <div className="bubble user">1<div className="time">8:02 AM ✓✓</div></div>
          <div className="bubble bot">
            <div>మార్నింగ్ BP టాబ్లెట్ వేసుకున్నావా?</div>
            <div className="quick-replies">
              <div className="qr">1️⃣ ✅ వేసుకున్నాను</div>
              <div className="qr">2️⃣ ⏳ ఇంకా లేదు</div>
            </div>
            <div className="time">8:02 AM</div>
          </div>
          <div className="bubble user">1<div className="time">8:03 AM ✓✓</div></div>
          <div className="bubble bot" style={{fontSize:12}}>బాగుంది! టిఫిన్ తిని మిగతా మాత్రలు వేసుకో. జాగ్రత్త! 🙏<div className="time">8:03 AM</div></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAQ ITEM
// ═══════════════════════════════════════════════════════════════════════════════

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
      <div className="faq-q">{q}<span className="faq-toggle"><PlusIcon /></span></div>
      <div className="faq-a">{a}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING MODAL — 3 steps
// ═══════════════════════════════════════════════════════════════════════════════

function OnboardingModal({ onClose }) {
  const [step, setStep]             = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(null);
  const [form, setForm]             = useState({
    child_name:      "",
    child_dial:      "+1",
    child_phone:     "",
    parent_name:     "",
    parent_nickname: "",
    parent_dial:     "+91",
    parent_phone:    "",
    language:        "te",
    checkin_time:    "08:00",
    city:            "",
    emg_name:        "",
    emg_dial:        "+91",
    emg_phone:       "",
    routine:         "",
  });

  const overlayRef = useRef(null);
  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const canNext1 = form.child_name.trim() && form.child_phone.trim();
  const canNext2 = form.parent_name.trim() && form.parent_nickname.trim() && form.parent_phone.trim();

  const buildPhone = (dial, num) => dial + num.trim().replace(/\D/g, "");

  const formatTime = (t) => {
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  const handleSubmit = async () => {
    if (!canNext2 || submitting) return;
    setSubmitting(true);

    const routineParts = [form.routine.trim(), form.city ? `Lives in ${form.city}.` : ""].filter(Boolean);

    const payload = {
      child_name:        form.child_name.trim(),
      child_phone:       buildPhone(form.child_dial, form.child_phone),
      parent_name:       form.parent_name.trim(),
      parent_nickname:   form.parent_nickname.trim(),
      parent_phone:      buildPhone(form.parent_dial, form.parent_phone),
      language:          form.language,
      checkin_time:      form.checkin_time,
      routine:           routineParts.join(" "),
      emergency_contact: form.emg_phone ? buildPhone(form.emg_dial, form.emg_phone) : "",
    };

    const waLink = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=${encodeURIComponent(
      `Hi AYANA, I just signed up! My name is ${payload.child_name}. Setting up care for ${payload.parent_nickname}.`
    )}`;

    let ok = false;
    try {
      const apiUrl = BACKEND_URL ? `${BACKEND_URL}/child/onboard` : "/api/onboard";
      const resp = await fetch(apiUrl, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      ok = resp.ok;
    } catch { ok = false; } finally { setSubmitting(false); }

    setSuccess({ nickname: payload.parent_nickname, checkin_time: payload.checkin_time, waLink, ok });
  };

  const STEP_TITLES = ["Your details", "Parent profile", "Routine & safety"];
  const STEP_SUBS   = [
    "Who should receive daily reports?",
    "Tell us about the parent AYANA will check in with.",
    "Help AYANA personalise check-ins and know who to call in emergencies.",
  ];

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>

        {success ? (
          <>
            <div style={{textAlign:"center",padding:"8px 0 24px"}}>
              <div style={{fontSize:52,marginBottom:16}}>✅</div>
              <h2 style={{marginBottom:8}}>{success.nickname} is all set!</h2>
              <p className="modal-sub" style={{margin:"0 0 16px"}}>
                They&apos;ll get their first check-in at <strong>{formatTime(success.checkin_time)}</strong> IST.
                AYANA is sending them a welcome message now.
              </p>
              {!success.ok && (
                <p style={{fontSize:13,color:"var(--ember)",marginBottom:16,lineHeight:1.5}}>
                  ⚠️ Couldn&apos;t reach server — tap below to complete setup over WhatsApp.
                </p>
              )}
            </div>
            <a href={success.waLink} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"15px",background:"var(--wa-green)",color:"white",borderRadius:60,fontSize:15,fontWeight:600,textDecoration:"none",boxShadow:"0 4px 20px rgba(37,211,102,0.2)"}}>
              <WhatsAppIcon size={18} /> Open WhatsApp to confirm
            </a>
            <p className="form-footnote" style={{marginTop:14}}>No credit card needed · Cancel anytime on WhatsApp</p>
          </>
        ) : (
          <>
            <StepIndicator current={step} />
            <h2 style={{marginTop:20}}>{STEP_TITLES[step-1]}</h2>
            <p className="modal-sub">{STEP_SUBS[step-1]}</p>

            {/* ── STEP 1: Your details ── */}
            {step === 1 && (
              <>
                <div className="form-group">
                  <label>Your full name</label>
                  <input type="text" placeholder="e.g. Guna Kanumuri" value={form.child_name}
                    onChange={e => update("child_name", e.target.value)} autoFocus />
                </div>
                <PhoneInput
                  label="Your WhatsApp number"
                  hint="You'll receive daily reports and emergency alerts here"
                  dialCode={form.child_dial}
                  onDialChange={v => update("child_dial", v)}
                  value={form.child_phone}
                  onChange={v => update("child_phone", v)}
                />
                <button className="form-submit" disabled={!canNext1} onClick={() => setStep(2)}>
                  Next — Parent details →
                </button>
              </>
            )}

            {/* ── STEP 2: Parent profile ── */}
            {step === 2 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent&apos;s full name</label>
                    <input type="text" placeholder="e.g. Lakshmi Devi" value={form.parent_name}
                      onChange={e => update("parent_name", e.target.value)} autoFocus />
                    <div className="form-hint">Used in health reports</div>
                  </div>
                  <div className="form-group">
                    <label>What do you call them?</label>
                    <input type="text" placeholder="Amma, Nanna, Daddy..." value={form.parent_nickname}
                      onChange={e => update("parent_nickname", e.target.value)} />
                    <div className="form-hint">Used in every voice message</div>
                  </div>
                </div>
                <PhoneInput
                  label="Parent's WhatsApp number"
                  hint="AYANA sends daily voice messages here — must be on WhatsApp"
                  dialCode={form.parent_dial}
                  onDialChange={v => update("parent_dial", v)}
                  value={form.parent_phone}
                  onChange={v => update("parent_phone", v)}
                />
                <div className="form-row">
                  <div className="form-group">
                    <label>Their language</label>
                    <select value={form.language} onChange={e => update("language", e.target.value)}>
                      {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label} ({l.en})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Morning check-in time</label>
                    <select value={form.checkin_time} onChange={e => update("checkin_time", e.target.value)}>
                      {CHECKIN_TIMES.map(t => <option key={t} value={t}>{formatTime(t)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>City / location <span style={{fontWeight:400,color:"var(--text-faint)"}}>(optional)</span></label>
                  <input type="text" placeholder="e.g. Hyderabad, Vijayawada..." value={form.city}
                    onChange={e => update("city", e.target.value)} />
                  <div className="form-hint">Helps AYANA give location-aware emergency info</div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="form-back" onClick={() => setStep(1)}>← Back</button>
                  <button className="form-submit" disabled={!canNext2} onClick={() => setStep(3)} style={{flex:1}}>
                    Next — Routine & safety →
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 3: Routine & emergency ── */}
            {step === 3 && (
              <>
                <div className="form-group">
                  <label>
                    Daily routine &amp; medicines{" "}
                    <span style={{fontWeight:400,color:"var(--text-faint)"}}>(optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Wakes at 6am, BP tablet before tea, tiffin at 8:30, metformin after tiffin, lunch at 1pm, evening walk at 5, dinner at 8, atorvastatin at night..."
                    value={form.routine}
                    onChange={e => update("routine", e.target.value)}
                  />
                  <div className="form-hint">Describe naturally — AI extracts medicines, meal times, and activities automatically.</div>
                </div>

                <div className="emergency-block">
                  <div className="emergency-label">🚨 Emergency backup contact <span style={{fontWeight:400,fontSize:12}}>(optional but recommended)</span></div>
                  <div className="form-hint" style={{marginBottom:12}}>
                    If AYANA detects an emergency and can&apos;t reach you, it calls this person next — a sibling, relative, or trusted neighbour.
                  </div>
                  <div className="form-group">
                    <label>Their name</label>
                    <input type="text" placeholder="e.g. Ravi (brother), Priya (sister)" value={form.emg_name}
                      onChange={e => update("emg_name", e.target.value)} />
                  </div>
                  <PhoneInput
                    label="Their phone number"
                    dialCode={form.emg_dial}
                    onDialChange={v => update("emg_dial", v)}
                    value={form.emg_phone}
                    onChange={v => update("emg_phone", v)}
                    placeholder="Phone or WhatsApp"
                  />
                </div>

                <div style={{display:"flex",gap:10}}>
                  <button className="form-back" onClick={() => setStep(2)}>← Back</button>
                  <button className="form-submit" disabled={!canNext2 || submitting} onClick={handleSubmit} style={{flex:1}}>
                    {submitting ? "Setting up..." : <><WhatsAppIcon size={18} /> Start free trial</>}
                  </button>
                </div>
                <div className="form-footnote">No credit card needed. Cancel anytime on WhatsApp.</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const globalStyles = `
:root {
  --forest:#145C48;--forest-deep:#0B3D30;--forest-glow:#1B7A5E;
  --sage:#E9F2ED;--sage-mid:#C8DDD0;--cream:#FDFBF7;--sand:#EDE8DD;
  --text:#1E1E1C;--text-soft:#5A5750;--text-faint:#918D84;
  --ember:#D15A2B;--ember-glow:#E87A4E;--ember-light:#FFF3EC;
  --wa-green:#25D366;--wa-dark:#128C7E;
  --serif:'Playfair Display',Georgia,serif;
  --sans:'Plus Jakarta Sans',system-ui,sans-serif;
  --r-lg:20px;--r-md:14px;
  --shadow-soft:0 2px 20px rgba(20,92,72,0.06);
  --shadow-lift:0 12px 48px rgba(20,92,72,0.1);
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font-family:var(--sans);color:var(--text);background:var(--cream);overflow-x:hidden;-webkit-font-smoothing:antialiased;}
body::after{content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:0.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:256px;}
.container{max-width:1120px;margin:0 auto;padding:0 28px;}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(253,251,247,0.72);backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);border-bottom:1px solid rgba(20,92,72,0.05);padding:14px 0;transition:box-shadow 0.3s;}
nav.scrolled{box-shadow:0 1px 16px rgba(0,0,0,0.04);}
.nav-inner{max-width:1120px;margin:0 auto;padding:0 28px;display:flex;justify-content:space-between;align-items:center;}
.logo{font-family:var(--serif);font-size:26px;font-weight:700;color:var(--forest-deep);text-decoration:none;letter-spacing:-0.5px;}
.logo span{color:var(--ember);}
.nav-links{display:flex;align-items:center;gap:28px;}
.nav-links a{font-size:14px;font-weight:500;color:var(--text-soft);text-decoration:none;transition:color 0.2s;}
.nav-links a:hover{color:var(--forest);}
.nav-cta{background:var(--forest);color:white;padding:10px 22px;border-radius:50px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all 0.25s;display:inline-flex;align-items:center;gap:7px;font-family:var(--sans);}
.nav-cta:hover{background:var(--forest-glow);transform:translateY(-1px);box-shadow:var(--shadow-lift);}
.hero{padding:150px 0 60px;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;top:80px;left:50%;transform:translateX(-50%);width:900px;height:900px;background:radial-gradient(circle at 50% 40%,rgba(20,92,72,0.04) 0%,transparent 70%);pointer-events:none;}
.hero-content{display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center;}
.hero-text{position:relative;z-index:2;}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--sage);color:var(--forest);padding:7px 18px 7px 12px;border-radius:50px;font-size:13px;font-weight:500;margin-bottom:28px;border:1px solid var(--sage-mid);opacity:0;animation:slideUp 0.7s ease forwards;}
.pulse-dot{width:7px;height:7px;border-radius:50%;background:var(--wa-green);position:relative;display:inline-block;}
.pulse-dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;border:1.5px solid var(--wa-green);animation:ripple 2s ease-out infinite;}
@keyframes ripple{0%{transform:scale(1);opacity:0.5;}100%{transform:scale(2.2);opacity:0;}}
.hero h1{font-family:var(--serif);font-size:clamp(36px,5.2vw,58px);line-height:1.12;color:var(--forest-deep);max-width:560px;letter-spacing:-1.5px;font-weight:700;opacity:0;animation:slideUp 0.7s ease 0.1s forwards;}
.hero h1 em{font-style:italic;background:linear-gradient(135deg,var(--ember),var(--ember-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.hero-sub{font-size:17px;line-height:1.75;color:var(--text-soft);max-width:460px;margin:20px 0 32px;opacity:0;animation:slideUp 0.7s ease 0.2s forwards;}
.hero-actions{display:flex;align-items:center;gap:16px;flex-wrap:wrap;opacity:0;animation:slideUp 0.7s ease 0.3s forwards;}
.btn-primary{display:inline-flex;align-items:center;gap:10px;background:var(--wa-green);color:white;padding:16px 34px;border-radius:60px;font-size:16px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 24px rgba(37,211,102,0.2);font-family:var(--sans);}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(37,211,102,0.3);}
.btn-ghost{font-size:14px;color:var(--text-soft);font-weight:500;text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:8px 4px;transition:color 0.2s;}
.btn-ghost:hover{color:var(--forest);}
.hero-proof{margin-top:36px;display:flex;align-items:center;gap:14px;opacity:0;animation:slideUp 0.7s ease 0.4s forwards;}
.proof-faces{display:flex;}
.proof-face{width:30px;height:30px;border-radius:50%;border:2px solid var(--cream);margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;}
.proof-face:first-child{margin-left:0;}.proof-face.f1{background:var(--forest);}.proof-face.f2{background:var(--ember);}.proof-face.f3{background:var(--wa-dark);}.proof-face.f4{background:#8B6B4E;}
.proof-text{font-size:13px;color:var(--text-faint);line-height:1.4;}.proof-text strong{color:var(--text-soft);font-weight:600;}
@keyframes slideUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
.hero-visual{display:flex;justify-content:center;align-items:center;position:relative;opacity:0;animation:slideUp 0.8s ease 0.35s forwards;}
.phone-frame{width:290px;background:#1A1A1A;border-radius:38px;padding:10px;position:relative;z-index:2;box-shadow:0 40px 80px rgba(0,0,0,0.12),0 2px 6px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.04);}
.phone-notch{width:90px;height:22px;background:#1A1A1A;border-radius:0 0 14px 14px;margin:0 auto;margin-top:-2px;}
.phone-screen{background:#ECE5DD;border-radius:28px;overflow:hidden;min-height:420px;}
.wa-header{background:var(--wa-dark);color:white;padding:12px 14px;display:flex;align-items:center;gap:10px;}
.wa-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--sage),var(--sage-mid));display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--forest-deep);font-weight:700;}
.wa-name{font-size:14px;font-weight:600;}.wa-status{font-size:11px;opacity:0.7;}
.chat-area{padding:12px 10px;}
.bubble{max-width:82%;padding:8px 11px;border-radius:10px;margin-bottom:5px;font-size:12.5px;line-height:1.5;position:relative;}
.bubble.bot{background:white;margin-right:auto;border-top-left-radius:3px;box-shadow:0 1px 1px rgba(0,0,0,0.04);}
.bubble.user{background:#DCF8C6;margin-left:auto;border-top-right-radius:3px;}
.bubble .time{font-size:10px;color:#93918B;text-align:right;margin-top:3px;}
.voice-msg{display:flex;align-items:center;gap:8px;background:white;padding:8px 11px;border-radius:10px;margin-bottom:5px;border-top-left-radius:3px;max-width:72%;box-shadow:0 1px 1px rgba(0,0,0,0.04);}
.voice-play{width:28px;height:28px;border-radius:50%;background:var(--wa-green);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;}
.voice-play::after{content:'';width:0;height:0;border-left:8px solid white;border-top:5px solid transparent;border-bottom:5px solid transparent;margin-left:2px;}
.voice-waves{display:flex;align-items:center;gap:2px;height:18px;flex:1;}
.voice-waves span{width:3px;border-radius:2px;background:var(--wa-dark);opacity:0.4;}
.voice-dur{font-size:11px;color:#93918B;}
.quick-replies{display:flex;flex-direction:column;gap:3px;margin-top:6px;}
.qr{display:flex;align-items:center;gap:5px;padding:4px 9px;background:rgba(20,92,72,0.05);border-radius:6px;font-size:11.5px;color:var(--forest-deep);}
.chat-area>*{opacity:0;animation:msgPop 0.35s ease forwards;}
.chat-area>:nth-child(1){animation-delay:0.6s;}.chat-area>:nth-child(2){animation-delay:1s;}.chat-area>:nth-child(3){animation-delay:1.5s;}.chat-area>:nth-child(4){animation-delay:1.9s;}.chat-area>:nth-child(5){animation-delay:2.3s;}.chat-area>:nth-child(6){animation-delay:2.7s;}
@keyframes msgPop{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
.how-section{padding:100px 0 80px;}
.section-eyebrow{font-size:12px;font-weight:600;color:var(--ember);text-transform:uppercase;letter-spacing:2.5px;margin-bottom:12px;}
.section-heading{font-family:var(--serif);font-size:clamp(28px,4vw,42px);color:var(--forest-deep);margin-bottom:12px;letter-spacing:-0.8px;line-height:1.2;font-weight:700;}
.section-desc{font-size:16px;color:var(--text-soft);max-width:500px;line-height:1.7;margin-bottom:48px;}
.steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;counter-reset:step;}
.step-card{background:white;border-radius:var(--r-lg);padding:32px 26px;border:1px solid rgba(20,92,72,0.06);position:relative;overflow:hidden;transition:transform 0.35s,box-shadow 0.35s;}
.step-card:hover{transform:translateY(-5px);box-shadow:var(--shadow-lift);}
.step-card::before{counter-increment:step;content:counter(step);position:absolute;top:16px;right:20px;font-family:var(--serif);font-size:60px;font-weight:700;color:var(--sage);line-height:1;pointer-events:none;}
.step-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:20px;}
.step-icon.green{background:var(--sage);}.step-icon.amber{background:var(--ember-light);}.step-icon.teal{background:#E5F6F6;}
.step-card h3{font-size:17px;font-weight:700;margin-bottom:8px;color:var(--forest-deep);}.step-card p{font-size:14px;line-height:1.7;color:var(--text-soft);}
.step-time{display:inline-block;margin-top:14px;font-size:12px;font-weight:600;color:var(--forest);background:var(--sage);padding:4px 12px;border-radius:50px;}
.experience-section{padding:100px 0;background:var(--forest-deep);position:relative;overflow:hidden;}
.experience-section::before{content:'';position:absolute;top:-200px;right:-100px;width:600px;height:600px;background:radial-gradient(circle,rgba(37,211,102,0.07) 0%,transparent 60%);}
.experience-section .section-eyebrow{color:var(--sage-mid);}.experience-section .section-heading{color:white;max-width:600px;}.experience-section .section-desc{color:rgba(255,255,255,0.55);}
.exp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.exp-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:var(--r-lg);padding:26px 22px;backdrop-filter:blur(8px);transition:background 0.3s,border-color 0.3s;}
.exp-card:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.14);}
.exp-icon{font-size:26px;margin-bottom:14px;display:block;}.exp-card h3{font-size:15px;font-weight:600;margin-bottom:6px;color:white;}.exp-card p{font-size:13px;line-height:1.65;color:rgba(255,255,255,0.5);}
.pricing-section{padding:100px 0;text-align:center;}
.price-card{max-width:420px;margin:40px auto 0;background:white;border-radius:24px;padding:44px 36px;border:1px solid rgba(20,92,72,0.08);box-shadow:var(--shadow-lift);position:relative;overflow:hidden;text-align:left;}
.price-gradient-bar{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--wa-green),var(--forest));}
.price-tag{display:inline-block;background:var(--sage);color:var(--forest);padding:5px 14px;border-radius:50px;font-size:11px;font-weight:700;margin-bottom:18px;letter-spacing:0.8px;}
.price-amount{font-family:var(--serif);font-size:52px;color:var(--forest-deep);font-weight:700;letter-spacing:-2px;line-height:1;}
.price-amount .currency{font-size:26px;vertical-align:super;}.price-amount .period{font-size:16px;color:var(--text-faint);font-family:var(--sans);font-weight:400;letter-spacing:0;}
.price-scope{font-size:14px;color:var(--text-soft);margin:6px 0 24px;}
.price-list{margin-bottom:28px;}
.price-item{display:flex;align-items:flex-start;gap:12px;padding:9px 0;font-size:14px;color:var(--text);}
.price-item+.price-item{border-top:1px solid rgba(0,0,0,0.04);}
.price-item .check{width:20px;height:20px;border-radius:50%;background:var(--sage);color:var(--forest);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
.price-cta{display:block;width:100%;text-align:center;background:var(--wa-green);color:white;padding:15px;border-radius:60px;font-size:16px;font-weight:600;border:none;cursor:pointer;transition:all 0.3s;font-family:var(--sans);box-shadow:0 4px 20px rgba(37,211,102,0.2);}
.price-cta:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(37,211,102,0.3);}
.price-nri{margin-top:14px;font-size:13px;color:var(--text-faint);text-align:center;}
.faq-section{padding:80px 0;}
.faq-list{max-width:660px;margin:32px auto 0;}
.faq-item{border-bottom:1px solid rgba(0,0,0,0.05);padding:20px 0;cursor:pointer;}
.faq-q{font-size:16px;font-weight:600;color:var(--forest-deep);display:flex;justify-content:space-between;align-items:center;gap:16px;}
.faq-toggle{width:28px;height:28px;border-radius:50%;flex-shrink:0;background:var(--sage);display:flex;align-items:center;justify-content:center;transition:all 0.3s;}
.faq-item.open .faq-toggle{background:var(--forest);color:white;transform:rotate(45deg);}
.faq-a{font-size:14px;line-height:1.75;color:var(--text-soft);max-height:0;overflow:hidden;transition:max-height 0.4s ease,margin 0.3s;}
.faq-item.open .faq-a{max-height:220px;margin-top:12px;}
.final-cta-section{padding:100px 0;background:var(--forest-deep);position:relative;}
footer{background:var(--forest-deep);color:rgba(255,255,255,0.5);padding:0 0 36px;font-size:13px;border-top:1px solid rgba(255,255,255,0.06);}
.footer-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;padding-top:32px;}
.footer-logo{font-family:var(--serif);font-size:22px;font-weight:700;color:white;text-decoration:none;}
.footer-logo span{color:var(--ember-glow);}
.footer-links{display:flex;gap:24px;}
.footer-links a{color:rgba(255,255,255,0.5);text-decoration:none;font-size:13px;transition:color 0.2s;}
.footer-links a:hover{color:white;}
.footer-note{text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);}
.modal-overlay{position:fixed;inset:0;z-index:200;background:rgba(11,61,48,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;padding:20px;}
.modal{background:var(--cream);border-radius:24px;width:100%;max-width:480px;padding:36px 32px;max-height:92vh;overflow-y:auto;animation:modalSlide 0.35s ease;box-shadow:0 40px 80px rgba(0,0,0,0.2);position:relative;}
@keyframes modalSlide{from{opacity:0;transform:translateY(14px) scale(0.97);}}
.modal-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;background:var(--sand);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-soft);font-size:20px;transition:background 0.2s;font-family:var(--sans);}
.modal-close:hover{background:var(--sage-mid);}
.modal h2{font-family:var(--serif);font-size:24px;color:var(--forest-deep);font-weight:700;letter-spacing:-0.5px;}
.modal-sub{font-size:14px;color:var(--text-soft);margin:4px 0 20px;line-height:1.5;}
.step-indicator{display:flex;align-items:center;margin-bottom:4px;}
.step-item{display:flex;align-items:center;flex:1;}
.step-item:last-child{flex:none;}
.step-bubble{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:var(--sand);color:var(--text-faint);flex-shrink:0;transition:all 0.3s;border:2px solid transparent;}
.step-bubble.active{background:var(--forest);color:white;border-color:var(--forest);box-shadow:0 0 0 3px rgba(20,92,72,0.12);}
.step-bubble.done{background:var(--sage);color:var(--forest);border-color:var(--sage-mid);}
.step-label{font-size:10px;font-weight:600;color:var(--text-faint);margin-left:5px;white-space:nowrap;transition:color 0.3s;}
.step-label.active{color:var(--forest);}
.step-line{flex:1;height:2px;background:var(--sand);margin:0 6px;transition:background 0.3s;min-width:10px;}
.step-line.done{background:var(--sage-mid);}
.form-group{margin-bottom:14px;}
.form-group label{display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:5px;}
.form-group input,.form-group select{width:100%;padding:11px 14px;border:1.5px solid rgba(20,92,72,0.12);border-radius:var(--r-md);font-size:14px;font-family:var(--sans);background:white;transition:border-color 0.2s,box-shadow 0.2s;color:var(--text);}
.form-group input::placeholder{color:var(--text-faint);}
.form-group input:focus,.form-group select:focus{outline:none;border-color:var(--forest);box-shadow:0 0 0 3px rgba(20,92,72,0.08);}
.form-group textarea{width:100%;padding:11px 14px;border:1.5px solid rgba(20,92,72,0.12);border-radius:var(--r-md);font-size:14px;font-family:var(--sans);background:white;transition:border-color 0.2s,box-shadow 0.2s;color:var(--text);resize:vertical;line-height:1.6;min-height:90px;}
.form-group textarea::placeholder{color:var(--text-faint);}
.form-group textarea:focus{outline:none;border-color:var(--forest);box-shadow:0 0 0 3px rgba(20,92,72,0.08);}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.form-hint{font-size:11px;color:var(--text-faint);margin-top:4px;}
.phone-row{display:flex;position:relative;}
.dial-btn{display:flex;align-items:center;gap:4px;padding:0 10px;border:1.5px solid rgba(20,92,72,0.12);border-right:none;border-radius:var(--r-md) 0 0 var(--r-md);background:var(--sand);cursor:pointer;font-size:13px;font-family:var(--sans);color:var(--text);white-space:nowrap;height:44px;transition:background 0.2s;flex-shrink:0;}
.dial-btn:hover{background:var(--sage);}
.dial-arrow{font-size:10px;color:var(--text-faint);}
.phone-num-input{flex:1;padding:11px 14px;border:1.5px solid rgba(20,92,72,0.12);border-radius:0 var(--r-md) var(--r-md) 0;font-size:14px;font-family:var(--sans);background:white;color:var(--text);transition:border-color 0.2s,box-shadow 0.2s;min-width:0;}
.phone-num-input::placeholder{color:var(--text-faint);}
.phone-num-input:focus{outline:none;border-color:var(--forest);box-shadow:0 0 0 3px rgba(20,92,72,0.08);}
.country-drop{position:absolute;top:calc(100% + 4px);left:0;width:280px;background:white;border-radius:12px;border:1px solid rgba(20,92,72,0.1);box-shadow:0 8px 32px rgba(0,0,0,0.12);z-index:300;overflow:hidden;}
.country-search{width:100%;padding:10px 14px;border:none;border-bottom:1px solid rgba(20,92,72,0.08);font-size:13px;font-family:var(--sans);outline:none;background:var(--sand);}
.country-list{max-height:200px;overflow-y:auto;}
.country-item{display:flex;align-items:center;gap:8px;padding:8px 14px;cursor:pointer;transition:background 0.15s;font-size:13px;}
.country-item:hover{background:var(--sage);}
.country-item.active{background:var(--sage);font-weight:600;}
.country-name{flex:1;color:var(--text);}
.country-dial{color:var(--text-faint);font-size:12px;}
.emergency-block{background:var(--ember-light);border:1px solid rgba(209,90,43,0.12);border-radius:var(--r-md);padding:16px;margin-bottom:16px;}
.emergency-label{font-size:13px;font-weight:700;color:var(--ember);margin-bottom:4px;}
.form-submit{width:100%;padding:14px;margin-top:8px;background:var(--wa-green);color:white;border:none;border-radius:60px;font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 20px rgba(37,211,102,0.2);}
.form-submit:hover{box-shadow:0 8px 28px rgba(37,211,102,0.3);transform:translateY(-1px);}
.form-submit:disabled{opacity:0.5;cursor:not-allowed;transform:none;box-shadow:none;}
.form-back{padding:14px 20px;margin-top:8px;background:var(--sand);color:var(--text-soft);border:none;border-radius:60px;font-size:14px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:background 0.2s;white-space:nowrap;}
.form-back:hover{background:var(--sage-mid);}
.form-footnote{text-align:center;margin-top:12px;font-size:12px;color:var(--text-faint);}
.reveal{opacity:0;transform:translateY(24px);transition:opacity 0.6s ease,transform 0.6s ease;}
.reveal.visible{opacity:1;transform:translateY(0);}
@media(max-width:900px){
  .hero-content{grid-template-columns:1fr;text-align:center;}
  .hero h1,.hero-sub{margin-left:auto;margin-right:auto;}
  .hero-actions{justify-content:center;}.hero-proof{justify-content:center;}
  .hero-visual{margin-top:16px;}
  .exp-grid{grid-template-columns:1fr 1fr;}
  .steps-grid{grid-template-columns:1fr;max-width:400px;margin:0 auto;}
  .nav-links a:not(.nav-cta):not(button){display:none;}
}
@media(max-width:640px){
  .hero{padding:125px 0 40px;}
  .exp-grid{grid-template-columns:1fr;}
  .phone-frame{width:260px;}
  .modal{padding:24px 18px;}
  .form-row{grid-template-columns:1fr;}
  .footer-inner{flex-direction:column;text-align:center;}
  .price-card{padding:32px 24px;}
  .step-label{display:none;}
  .country-drop{width:240px;}
}
`;