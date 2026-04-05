/**
 * /api/onboard — Onboarding proxy for the AYANA landing page.
 *
 * Always forwards to the FastAPI backend at BACKEND_URL/child/onboard.
 * FastAPI handles Supabase writes, Gemini extraction, and fires the first
 * check-in automatically.
 *
 * Environment variables required in Vercel / .env.local:
 *   NEXT_PUBLIC_BACKEND_URL  e.g. https://ayana-api.railway.app
 *
 * Request body:
 *   {
 *     child_name:      string,
 *     child_phone:     string,   // any format — FastAPI normalises to E.164
 *     parent_name:     string,
 *     parent_nickname: string,
 *     parent_phone:    string,
 *     language:        string,   // "te" | "hi" | "ta" | ...
 *     checkin_time:    string,   // "08:00"
 *     routine:         string,   // natural language description (optional)
 *   }
 *
 * Response (proxied from FastAPI):
 *   { status, family_id, child_id, parent_id, message }
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed" });
  }

  const {
    child_name,
    child_phone,
    parent_name,
    parent_nickname,
    parent_phone,
    language = "te",
    checkin_time = "08:00",
    routine = "",
  } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────
  if (!child_name || !child_phone || !parent_nickname || !parent_phone) {
    return res.status(400).json({
      detail: "Missing required fields: child_name, child_phone, parent_nickname, parent_phone",
    });
  }

  // ── Proxy to FastAPI backend ────────────────────────────────────────────
  // NEXT_PUBLIC_ prefix makes it available on both server and client side.
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL;

  if (!backendUrl) {
    // No backend configured — tell the user clearly rather than silently failing
    console.error("[onboard] NEXT_PUBLIC_BACKEND_URL is not set");
    return res.status(503).json({
      detail:
        "Backend not configured. Set NEXT_PUBLIC_BACKEND_URL in your Vercel environment variables.",
    });
  }

  const payload = {
    child_name:      child_name.trim(),
    child_phone,
    parent_name:     (parent_name || parent_nickname).trim(),
    parent_nickname: parent_nickname.trim(),
    parent_phone,
    language,
    checkin_time,
    routine:         routine.trim(),   // ← passed through so FastAPI can run Gemini extraction
  };

  try {
    const resp = await fetch(`${backendUrl}/child/onboard`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    let data;
    try {
      data = await resp.json();
    } catch {
      data = { detail: "Backend returned an unparseable response" };
    }

    if (resp.ok) {
      return res.status(200).json(data);
    }

    // FastAPI returned a 4xx/5xx — surface the error clearly
    console.error(`[onboard] FastAPI ${resp.status}:`, data);
    return res.status(resp.status).json(data);

  } catch (err) {
    // Network error (Railway down, DNS failure, etc.)
    console.error("[onboard] Could not reach backend:", err.message);
    return res.status(502).json({
      detail: `Could not reach the AYANA backend. Please try again. (${err.message})`,
    });
  }
}