/**
 * /api/onboard — Onboarding endpoint for AYANA landing page
 *
 * Two modes:
 *   1. PROXY MODE (recommended): Forwards to FastAPI backend at BACKEND_URL/child/onboard
 *      - Set NEXT_PUBLIC_BACKEND_URL in .env.local (e.g. https://ayana-api.railway.app)
 *      - FastAPI handles Supabase writes, message generation, scheduler setup
 *
 *   2. DIRECT MODE: Creates family/child/parent records directly in Supabase
 *      - Set SUPABASE_URL + SUPABASE_SERVICE_KEY in .env.local
 *      - Used when deploying dashboard independently from backend
 *      - Parent's first check-in is triggered when backend scheduler picks them up
 *
 * Request body (matches OnboardingStart schema in app/models/schemas.py):
 *   {
 *     child_name: string,
 *     child_phone: string,     // E.164 format: +919876543210
 *     parent_name: string,
 *     parent_nickname: string,
 *     parent_phone: string,    // E.164 format
 *     language: string,        // "te", "hi", "ta", etc.
 *     checkin_time: string,    // "08:00"
 *     routine?: string         // optional natural language description
 *   }
 */

import { createClient } from "@supabase/supabase-js";

// Voice defaults per language (matches seed_family.py)
const DEFAULT_VOICE = {
  te: "roopa", hi: "meera", ta: "pavithra", kn: "suresh",
  ml: "aparna", bn: "ananya", mr: "sumedha", gu: "nandita",
  pa: "suresh", en: "anushka",
};

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

  // ── MODE 1: Proxy to FastAPI backend ────────────────────────────────────
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

  if (backendUrl) {
    try {
      const resp = await fetch(`${backendUrl}/child/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_name,
          child_phone,
          parent_name: parent_name || parent_nickname,
          parent_nickname,
          parent_phone,
          language,
          checkin_time,
        }),
      });

      const data = await resp.json();

      if (resp.ok) {
        return res.status(200).json(data);
      } else {
        console.error("Backend onboard error:", data);
        // Fall through to direct mode if backend fails
      }
    } catch (err) {
      console.error("Backend unreachable:", err.message);
      // Fall through to direct mode
    }
  }

  // ── MODE 2: Direct Supabase write ──────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // No backend AND no Supabase → return success anyway
    // The landing page will redirect to WhatsApp regardless
    return res.status(200).json({
      status: "pending",
      message: "No backend configured. Redirecting to WhatsApp for manual setup.",
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if child already exists
    const { data: existingChild } = await supabase
      .from("children")
      .select("id, family_id")
      .eq("phone", child_phone)
      .maybeSingle();

    let familyId, childId;

    if (existingChild) {
      familyId = existingChild.family_id;
      childId = existingChild.id;
    } else {
      // Create family
      const { data: family, error: famErr } = await supabase
        .from("families")
        .insert({ plan: "trial", report_format: "combined" })
        .select("id")
        .single();

      if (famErr) throw famErr;
      familyId = family.id;

      // Create child
      const { data: child, error: childErr } = await supabase
        .from("children")
        .insert({
          family_id: familyId,
          phone: child_phone,
          name: child_name,
          report_time: "20:00",
        })
        .select("id")
        .single();

      if (childErr) throw childErr;
      childId = child.id;
    }

    // Check if parent already exists
    const { data: existingParent } = await supabase
      .from("parents")
      .select("id")
      .eq("phone", parent_phone)
      .maybeSingle();

    let parentId;

    if (existingParent) {
      parentId = existingParent.id;
    } else {
      const { data: parent, error: parErr } = await supabase
        .from("parents")
        .insert({
          family_id: familyId,
          phone: parent_phone,
          name: parent_name || parent_nickname,
          nickname: parent_nickname,
          language,
          tts_voice: DEFAULT_VOICE[language] || "roopa",
          checkin_time,
          is_active: true,
          routine: routine ? { description: routine } : {},
        })
        .select("id")
        .single();

      if (parErr) throw parErr;
      parentId = parent.id;
    }

    return res.status(200).json({
      status: "created",
      family_id: familyId,
      child_id: childId,
      parent_id: parentId,
      message: "Family created. Check-in will be sent at the configured time.",
    });
  } catch (err) {
    console.error("Supabase onboard error:", err);
    return res.status(500).json({
      detail: "Failed to create family. Please try again.",
    });
  }
}
