import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WAITLIST_SOURCE = "genta-website-waitlist";

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
    const { error } = await supabase.from("genta_waitlist").insert({
      email,
      source: WAITLIST_SOURCE,
      privacy_accepted_at: consentAt,
      privacy_policy_version: consentVersion,
    });

    const duplicate =
      error?.code === "23505" ||
      (typeof error?.message === "string" && error.message.includes("duplicate key"));
    if (error && !duplicate) {
      console.warn("[genta-waitlist] supabase insert:", error.code, error.message);
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
