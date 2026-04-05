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

type ParsedBody =
  | { channel: "json"; email: string; privacyAccepted: boolean }
  | { channel: "form"; email: string; privacyAccepted: boolean };

async function parseWaitlistBody(req: Request): Promise<ParsedBody | { error: NextResponse }> {
  const ct = (req.headers.get("content-type") ?? "").toLowerCase();

  if (ct.includes("application/json")) {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return {
        error: NextResponse.json(
          { error: { code: "INVALID_JSON", message: "Request body must be JSON" } },
          { status: 400 },
        ),
      };
    }
    const o = body as Record<string, unknown>;
    const email = typeof o.email === "string" ? o.email.trim() : "";
    const privacyAccepted = o.privacyAccepted === true;
    return { channel: "json", email, privacyAccepted };
  }

  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const fd = await req.formData();
    const email = String(fd.get("email") ?? "").trim();
    const pa = fd.get("privacyAccepted");
    const privacyAccepted = pa === "true" || pa === "on" || pa === "1";
    return { channel: "form", email, privacyAccepted };
  }

  return {
    error: NextResponse.json(
      {
        error: {
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Use application/json or application/x-www-form-urlencoded.",
        },
      },
      { status: 415 },
    ),
  };
}

type SignupFailure = "INVALID_EMAIL" | "PRIVACY_REQUIRED" | "STORE_ERROR" | "WEBHOOK_ERROR";

async function runWaitlistSignup(normalizedEmail: string): Promise<SignupFailure | null> {
  const consentAt = new Date().toISOString();
  const consentVersion = policyVersion();
  const consent = { at: consentAt, version: consentVersion };

  const supabase = createSupabaseAdmin();

  if (supabase) {
    const attempts = gentaWaitlistInsertAttempts(normalizedEmail, consentAt, consentVersion);
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
      return "STORE_ERROR";
    }

    void forwardToWebhook(normalizedEmail, consent).then((ok) => {
      if (!ok) {
        console.warn("[genta-waitlist] email stored in Supabase but webhook failed");
      }
    });

    return null;
  }

  const webhook = process.env.WAITLIST_WEBHOOK_URL?.trim();
  if (webhook) {
    const ok = await forwardToWebhook(normalizedEmail, consent);
    if (!ok) {
      return "WEBHOOK_ERROR";
    }
    return null;
  }

  console.info(
    "[genta-waitlist] signup (set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or WAITLIST_WEBHOOK_URL):",
    normalizedEmail,
  );
  return null;
}

function jsonError(
  code: string,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

function redirectWithQuery(
  req: Request,
  query: Record<string, string>,
  hash = "waitlist",
): NextResponse {
  const u = new URL("/", req.url);
  for (const [k, v] of Object.entries(query)) {
    u.searchParams.set(k, v);
  }
  u.hash = hash;
  return NextResponse.redirect(u, 303);
}

const ERROR_QUERY: Record<SignupFailure, string> = {
  INVALID_EMAIL: "email",
  PRIVACY_REQUIRED: "privacy",
  STORE_ERROR: "store",
  WEBHOOK_ERROR: "webhook",
};

const JSON_MESSAGES: Record<SignupFailure, string> = {
  INVALID_EMAIL: "A valid email is required",
  PRIVACY_REQUIRED: "Please confirm you agree to the Privacy Policy.",
  STORE_ERROR: "Could not save signup. Try again later.",
  WEBHOOK_ERROR: "Could not save signup. Try again later.",
};

export async function POST(req: Request) {
  const parsed = await parseWaitlistBody(req);
  if ("error" in parsed) {
    return parsed.error;
  }

  const { channel, email: rawEmail, privacyAccepted } = parsed;

  if (!rawEmail || !EMAIL_RE.test(rawEmail)) {
    if (channel === "form") {
      return redirectWithQuery(req, { waitlist_error: ERROR_QUERY.INVALID_EMAIL });
    }
    return jsonError("INVALID_EMAIL", JSON_MESSAGES.INVALID_EMAIL, 400);
  }

  if (!privacyAccepted) {
    if (channel === "form") {
      return redirectWithQuery(req, { waitlist_error: ERROR_QUERY.PRIVACY_REQUIRED });
    }
    return jsonError("PRIVACY_REQUIRED", JSON_MESSAGES.PRIVACY_REQUIRED, 400);
  }

  const email = rawEmail.toLowerCase();
  const fail = await runWaitlistSignup(email);
  if (fail) {
    if (channel === "form") {
      return redirectWithQuery(req, { waitlist_error: ERROR_QUERY[fail] });
    }
    const status = fail === "STORE_ERROR" || fail === "WEBHOOK_ERROR" ? 502 : 400;
    return jsonError(fail, JSON_MESSAGES[fail], status);
  }

  if (channel === "form") {
    return redirectWithQuery(req, { waitlist: "success" });
  }

  return NextResponse.json({ ok: true });
}
