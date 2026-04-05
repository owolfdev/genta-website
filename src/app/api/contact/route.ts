import { NextResponse } from "next/server";
import { gentaContactProjectId } from "@/lib/gentaProject";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_COMPANY = 200;
const MAX_MESSAGE = 10_000;

function clampStr(s: string, max: number): string {
  if (s.length <= max) {
    return s;
  }
  return s.slice(0, max);
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
  const rawName = typeof o.name === "string" ? o.name.trim() : "";
  const rawEmail = typeof o.email === "string" ? o.email.trim() : "";
  const rawMessage = typeof o.message === "string" ? o.message.trim() : "";
  const companyRaw = typeof o.company === "string" ? o.company.trim() : "";
  const company = companyRaw.length > 0 ? clampStr(companyRaw, MAX_COMPANY) : null;

  if (!rawName) {
    return NextResponse.json(
      { error: { code: "INVALID_NAME", message: "Name is required." } },
      { status: 400 },
    );
  }
  if (!rawEmail || !EMAIL_RE.test(rawEmail)) {
    return NextResponse.json(
      { error: { code: "INVALID_EMAIL", message: "A valid email is required." } },
      { status: 400 },
    );
  }
  if (!rawMessage) {
    return NextResponse.json(
      { error: { code: "INVALID_MESSAGE", message: "Message is required." } },
      { status: 400 },
    );
  }

  if (o.humanConfirmed !== true) {
    return NextResponse.json(
      {
        error: {
          code: "HUMAN_CHECK_REQUIRED",
          message: "Please confirm you're human.",
        },
      },
      { status: 400 },
    );
  }

  const name = clampStr(rawName, MAX_NAME);
  const email = clampStr(rawEmail.toLowerCase(), MAX_EMAIL);
  const message = clampStr(rawMessage, MAX_MESSAGE);

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        error: {
          code: "STORE_UNAVAILABLE",
          message: "Message could not be saved. Try again later or email us directly.",
        },
      },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("genta_contact_messages").insert({
    name,
    email,
    company,
    message,
    project_id: gentaContactProjectId(),
  });

  if (error) {
    console.warn("[genta-contact] supabase insert failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      { error: { code: "STORE_ERROR", message: "Could not save your message. Try again later." } },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
