import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WAITLIST_SOURCE = "genta-website-waitlist";

function isDuplicateKeyError(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "23505" ||
    (typeof error.message === "string" && error.message.includes("duplicate key"))
  );
}

/** Shapes to try in order — matches `waitlist_schema.sql` when all columns exist; falls back for minimal tables (email + source only). */
function gentaWaitlistInsertAttempts(
  email: string,
  consentAt: string,
  consentVersion: string,
): Record<string, string | boolean>[] {
  return [
    {
      email,
      source: WAITLIST_SOURCE,
      privacy_accepted: true,
      privacy_accepted_at: consentAt,
      privacy_policy_version: consentVersion,
    },
    {
      email,
      source: WAITLIST_SOURCE,
      privacy_accepted_at: consentAt,
      privacy_policy_version: consentVersion,
    },
    { email, source: WAITLIST_SOURCE },
  ];
}

function policyVersion(): string {
  return process.env.PRIVACY_POLICY_VERSION?.trim() || "1.0";
}

async function forwardToWebhook(
  email: string,
  consent: { at: string; version: string },
): Promise<boolean> {
  const webhook = process.env.WAITLIST_WEBHOOK_URL?.trim();
  if (!webhook) {
    return true;
  }
  const bearer = process.env.WAITLIST_WEBHOOK_BEARER?.trim();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }
  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        source: WAITLIST_SOURCE,
        privacy_accepted: true,
        privacy_accepted_at: consent.at,
        privacy_policy_version: consent.version,
      }),
    });
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.warn("[genta-waitlist] webhook failed:", upstream.status, text.slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[genta-waitlist] webhook error:", e);
    return false;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Request body must be JSON" } },
      { status: 400 },
    );
  }

  const o = body as Record<string, unknown>;
  const rawEmail = typeof o.email === "string" ? o.email.trim() : "";
  if (!rawEmail || !EMAIL_RE.test(rawEmail)) {
    return NextResponse.json(
      { error: { code: "INVALID_EMAIL", message: "A valid email is required" } },
      { status: 400 },
    );
  }

  if (o.privacyAccepted !== true) {
    return NextResponse.json(
      {
        error: {
          code: "PRIVACY_REQUIRED",
          message: "Please confirm you agree to the Privacy Policy.",
        },
      },
      { status: 400 },
    );
  }

  const email = rawEmail.toLowerCase();
  const consentAt = new Date().toISOString();
  const consentVersion = policyVersion();
  const consent = { at: consentAt, version: consentVersion };

  const supabase = createSupabaseAdmin();

  if (supabase) {
    const attempts = gentaWaitlistInsertAttempts(email, consentAt, consentVersion);
    let lastError: { code?: string; message?: string; details?: string; hint?: string } | null =
      null;

    for (let i = 0; i < attempts.length; i++) {
      const { error } = await supabase.from("genta_waitlist").insert(attempts[i]);
      if (!error) {
        if (i > 0) {
          console.info(
            "[genta-waitlist] insert used a narrower column set (attempt %d/%d). Run supabase/waitlist_schema.sql to add privacy audit columns.",
            i + 1,
            attempts.length,
          );
        }
        lastError = null;
        break;
      }
      if (isDuplicateKeyError(error)) {
        lastError = null;
        break;
      }
      lastError = error;
    }

    if (lastError) {
      console.warn("[genta-waitlist] supabase insert failed (all attempts):", {
        code: lastError.code,
        message: lastError.message,
        details: lastError.details,
        hint: lastError.hint,
      });
      return NextResponse.json(
        { error: { code: "STORE_ERROR", message: "Could not save signup. Try again later." } },
        { status: 502 },
      );
    }

    void forwardToWebhook(email, consent).then((ok) => {
      if (!ok) {
        console.warn("[genta-waitlist] email stored in Supabase but webhook failed");
      }
    });

    return NextResponse.json({ ok: true });
  }

  const webhook = process.env.WAITLIST_WEBHOOK_URL?.trim();
  if (webhook) {
    const ok = await forwardToWebhook(email, consent);
    if (!ok) {
      return NextResponse.json(
        { error: { code: "WEBHOOK_ERROR", message: "Could not save signup. Try again later." } },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  console.info(
    "[genta-waitlist] signup (set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or WAITLIST_WEBHOOK_URL):",
    email,
  );
  return NextResponse.json({ ok: true });
}
