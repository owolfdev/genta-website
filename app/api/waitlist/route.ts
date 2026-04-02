import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const email = typeof o.email === "string" ? o.email.trim() : "";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: { code: "INVALID_EMAIL", message: "A valid email is required" } },
      { status: 400 },
    );
  }

  const webhook = process.env.WAITLIST_WEBHOOK_URL?.trim();
  const bearer = process.env.WAITLIST_WEBHOOK_BEARER?.trim();

  if (webhook) {
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
          source: "genta-website-waitlist",
        }),
      });
      if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        console.warn("[genta-waitlist] webhook failed:", upstream.status, text.slice(0, 200));
        return NextResponse.json(
          { error: { code: "WEBHOOK_ERROR", message: "Could not save signup. Try again later." } },
          { status: 502 },
        );
      }
    } catch (e) {
      console.warn("[genta-waitlist] webhook error:", e);
      return NextResponse.json(
        { error: { code: "WEBHOOK_ERROR", message: "Could not save signup. Try again later." } },
        { status: 502 },
      );
    }
  } else {
    console.info("[genta-waitlist] signup (set WAITLIST_WEBHOOK_URL to forward):", email);
  }

  return NextResponse.json({ ok: true });
}
