/**
 * AYANA — Family Health Dashboard
 * Route: /report/[token]
 *
 * Token = base64url(JSON.stringify({ family_id, date, expires }))
 * No login required — token IS the auth. Link sent in daily report.
 *
 * Setup:
 *   1. Create pages/report/[token].jsx in your Next.js project
 *   2. Add to .env.local:
 *        NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *        NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 *   3. npm install @supabase/supabase-js
 */

import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client (lazy — avoids crash during build when env vars missing) ─
let _supabase = null;
function getSupabase() {
  if (!_supabase && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return _supabase;
}

// ─── Token helpers ────────────────────────────────────────────────────────────
function decodeToken(token) {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function generateReportToken(family_id, date) {
  const payload = {
    family_id,
    date: date || new Date().toISOString().slice(0, 10),
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
const MOOD_COLOR = { good: "#1D9E75", okay: "#EF9F27", not_well: "#E24B4A" };
const MOOD_LABEL = { good: "Good", okay: "Okay", not_well: "Not well" };
const MED_COLOR  = { taken: "#1D9E75", late: "#EF9F27", missed: "#E24B4A", none: "#D3D1C7" };


// ════════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export default function ReportPage({ params }) {
  const [token, setToken]         = useState(null);
  const [payload, setPayload]     = useState(null);
  const [parents, setParents]     = useState([]);
  const [active, setActive]       = useState(0);       // index of selected parent
  const [checkins, setCheckins]   = useState([]);
  const [concerns, setConcerns]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // ── Decode token from URL ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.location.pathname.split("/report/")[1];
    setToken(t);
    const p = t ? decodeToken(t) : null;
    if (!p || !p.family_id) { setError("Invalid or expired link."); setLoading(false); return; }
    if (p.expires < Date.now()) { setError("This report link has expired."); setLoading(false); return; }
    setPayload(p);
  }, []);

  // ── Load parents ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!payload) return;
    (async () => {
      const { data, error } = await getSupabase()
        .from("parents")
        .select("id, nickname, language, checkin_time")
        .eq("family_id", payload.family_id)
        .eq("is_active", true)
        .order("created_at");
      if (error) { setError("Could not load data."); setLoading(false); return; }
      setParents(data || []);
    })();
  }, [payload]);

  // ── Load 7-day check-ins + concerns for active parent ─────────────────────
  const loadParentData = useCallback(async (parent_id) => {
    if (!payload || !parent_id) return;
    setLoading(true);

    const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    const today = payload.date || new Date().toISOString().slice(0, 10);

    const [ciRes, conRes] = await Promise.all([
      getSupabase()
        .from("check_ins")
        .select("date, touchpoint, status, mood, concerns, medicine_taken, ai_extraction")
        .eq("parent_id", parent_id)
        .gte("date", since)
        .lte("date", today)
        .order("date", { ascending: true }),
      getSupabase()
        .from("concern_log")
        .select("concern_text, frequency, severity, last_seen")
        .eq("parent_id", parent_id)
        .eq("is_resolved", false)
        .order("frequency", { ascending: false })
        .limit(8),
    ]);

    setCheckins(ciRes.data || []);
    setConcerns(conRes.data || []);
    setLoading(false);
  }, [payload]);

  useEffect(() => {
    if (parents.length > 0) loadParentData(parents[active]?.id);
  }, [parents, active, loadParentData]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const daysWithReply = new Set(checkins.filter(c => c.status === "replied").map(c => c.date)).size;
  const moods = checkins.filter(c => c.mood).map(c => c.mood);
  const goodPct = moods.length ? Math.round(moods.filter(m => m === "good").length / moods.length * 100) : 0;

  const medCIs = checkins.filter(c => c.touchpoint?.startsWith("medicine_"));
  const medReplied = medCIs.filter(c => c.status === "replied");
  const medTaken = medReplied.filter(c => {
    const mt = c.medicine_taken;
    return mt && typeof mt === "object" && mt.taken;
  });
  const medPct = medCIs.length ? Math.round(medTaken.length / medCIs.length * 100) : null;

  const latestAI = checkins
    .filter(c => c.ai_extraction?.raw_summary)
    .slice(-3)
    .reverse()
    .map(c => ({ date: c.date, text: c.ai_extraction.raw_summary }));

  // ── Last 7 calendar dates ──────────────────────────────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toISOString().slice(0, 10);
  });

  // Mood per day (last reply of day)
  const moodByDay = {};
  checkins.filter(c => c.mood).forEach(c => { moodByDay[c.date] = c.mood; });

  // Medicine status per day
  const medByDay = {};
  last7.forEach(d => {
    const dayMed = medCIs.filter(c => c.date === d);
    if (!dayMed.length) { medByDay[d] = "none"; return; }
    const taken = dayMed.some(c => c.medicine_taken?.taken);
    const missed = dayMed.some(c => c.status === "missed");
    medByDay[d] = taken ? "taken" : missed ? "missed" : "late";
  });

  if (error) return <ErrorPage message={error} />;

  return (
    <>
      <Head>
        <title>AYANA — Family Report</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={s.page}>
        {/* ── Header ── */}
        <div style={s.header}>
          <div style={s.logo}>AYANA</div>
          <div style={s.headerSub}>Family Health Report</div>
          {payload?.date && <div style={s.headerDate}>{formatDate(payload.date)}</div>}
        </div>

        {/* ── Parent tabs ── */}
        {parents.length > 1 && (
          <div style={s.tabs}>
            {parents.map((p, i) => (
              <button
                key={p.id}
                style={{ ...s.tab, ...(i === active ? s.tabActive : {}) }}
                onClick={() => setActive(i)}
              >
                {p.nickname}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={s.loading}>Loading…</div>
        ) : (
          <>
            {/* ── Metric cards ── */}
            <div style={s.cards}>
              <MetricCard
                label="Check-in streak"
                value={`${daysWithReply}/7`}
                sub="days responded"
                color="#1D9E75"
              />
              <MetricCard
                label="Mood score"
                value={`${goodPct}%`}
                sub="days feeling good"
                color={goodPct >= 70 ? "#1D9E75" : goodPct >= 40 ? "#EF9F27" : "#E24B4A"}
              />
              <MetricCard
                label="Medicines"
                value={medPct !== null ? `${medPct}%` : "—"}
                sub={medPct !== null ? "adherence" : "not configured"}
                color={medPct === null ? "#888" : medPct >= 80 ? "#1D9E75" : "#EF9F27"}
              />
            </div>

            {/* ── 7-day mood chart ── */}
            <Section title="7-day mood">
              <div style={s.barRow}>
                {last7.map(d => {
                  const mood = moodByDay[d];
                  const color = mood ? MOOD_COLOR[mood] : "#D3D1C7";
                  return (
                    <div key={d} style={s.barCol}>
                      <div
                        style={{
                          ...s.bar,
                          background: color,
                          height: mood === "good" ? 40 : mood === "okay" ? 28 : mood === "not_well" ? 18 : 6,
                        }}
                        title={mood ? MOOD_LABEL[mood] : "No data"}
                      />
                      <div style={s.barLabel}>{d.slice(8)}</div>
                    </div>
                  );
                })}
              </div>
              <div style={s.legend}>
                {Object.entries(MOOD_COLOR).map(([k, c]) => (
                  <span key={k} style={s.legendItem}>
                    <span style={{ ...s.legendDot, background: c }} />
                    {MOOD_LABEL[k]}
                  </span>
                ))}
              </div>
            </Section>

            {/* ── Medicine heatmap ── */}
            {medPct !== null && (
              <Section title="Medicine heatmap">
                <div style={s.heatRow}>
                  {last7.map(d => {
                    const status = medByDay[d];
                    return (
                      <div key={d} style={s.heatCol}>
                        <div
                          style={{ ...s.heatCell, background: MED_COLOR[status] }}
                          title={`${d}: ${status}`}
                        />
                        <div style={s.barLabel}>{d.slice(8)}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={s.legend}>
                  {[["taken","Taken"], ["late","Late / unsure"], ["missed","Missed"], ["none","No meds"]].map(([k, label]) => (
                    <span key={k} style={s.legendItem}>
                      <span style={{ ...s.legendDot, background: MED_COLOR[k] }} />
                      {label}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Concerns ── */}
            {concerns.length > 0 && (
              <Section title="Active concerns">
                <div style={s.chipRow}>
                  {concerns.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        ...s.chip,
                        background:
                          c.severity === "severe" ? "#FCEBEB" :
                          c.severity === "moderate" ? "#FAEEDA" : "#EAF3DE",
                        color:
                          c.severity === "severe" ? "#A32D2D" :
                          c.severity === "moderate" ? "#854F0B" : "#3B6D11",
                      }}
                    >
                      {c.concern_text}
                      {c.frequency > 1 && (
                        <span style={s.chipCount}> ×{c.frequency}</span>
                      )}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* ── AI observations ── */}
            {latestAI.length > 0 && (
              <Section title="Recent observations">
                {latestAI.map((obs, i) => (
                  <div key={i} style={s.obsRow}>
                    <div style={s.obsDate}>{formatDate(obs.date)}</div>
                    <div style={s.obsText}>{obs.text}</div>
                  </div>
                ))}
              </Section>
            )}

            {/* ── Empty state ── */}
            {checkins.length === 0 && (
              <div style={s.empty}>No check-in data for this week yet.</div>
            )}
          </>
        )}

        <div style={s.footer}>AYANA — Daily care companion</div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={s.card}>
      <div style={{ ...s.cardValue, color }}>{value}</div>
      <div style={s.cardLabel}>{label}</div>
      <div style={s.cardSub}>{sub}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function ErrorPage({ message }) {
  return (
    <div style={{ ...s.page, alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: 18, color: "#A32D2D", textAlign: "center" }}>
        ⚠️ {message}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════════

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ════════════════════════════════════════════════════════════════════════════════
// STYLES  (mobile-first, inline, no Tailwind needed)
// ════════════════════════════════════════════════════════════════════════════════

const s = {
  page: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: 480,
    margin: "0 auto",
    padding: "0 0 48px",
    background: "#fff",
    minHeight: "100vh",
    color: "#2C2C2A",
  },
  header: {
    background: "#1D9E75",
    padding: "24px 20px 20px",
    color: "#fff",
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 13,
    opacity: 0.85,
    marginTop: 2,
  },
  headerDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #E8E6DF",
    background: "#F8F7F4",
  },
  tab: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    fontSize: 15,
    cursor: "pointer",
    color: "#5F5E5A",
    fontWeight: 400,
  },
  tabActive: {
    color: "#1D9E75",
    fontWeight: 600,
    borderBottom: "2px solid #1D9E75",
  },
  cards: {
    display: "flex",
    gap: 12,
    padding: "20px 16px 8px",
  },
  card: {
    flex: 1,
    background: "#F8F7F4",
    borderRadius: 10,
    padding: "14px 12px",
    textAlign: "center",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },
  cardLabel: {
    fontSize: 11,
    color: "#5F5E5A",
    marginTop: 6,
    fontWeight: 500,
  },
  cardSub: {
    fontSize: 10,
    color: "#888780",
    marginTop: 2,
  },
  section: {
    padding: "20px 16px 8px",
    borderTop: "1px solid #F1EFE8",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#5F5E5A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  barRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 6,
    height: 56,
  },
  barCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    transition: "height 0.3s",
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: "#888780",
    marginTop: 2,
  },
  heatRow: {
    display: "flex",
    gap: 6,
  },
  heatCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  heatCell: {
    width: "100%",
    height: 28,
    borderRadius: 4,
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 14px",
    marginTop: 12,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    color: "#5F5E5A",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    display: "inline-block",
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 20,
    fontWeight: 500,
  },
  chipCount: {
    opacity: 0.7,
    fontWeight: 400,
  },
  obsRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #F1EFE8",
  },
  obsDate: {
    fontSize: 11,
    color: "#888780",
    marginBottom: 3,
  },
  obsText: {
    fontSize: 14,
    color: "#2C2C2A",
    lineHeight: 1.5,
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#888780",
    fontSize: 14,
  },
  empty: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#B4B2A9",
    fontSize: 14,
  },
  footer: {
    textAlign: "center",
    padding: "32px 20px 0",
    fontSize: 11,
    color: "#B4B2A9",
  },
};