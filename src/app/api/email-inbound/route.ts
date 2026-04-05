import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { Attachment } from "resend";

/**
 * Resend inbound → forward to Gmail.
 *
 * Edge cases (operational notes):
 * - Webhooks are at-least-once; the same `email.received` may be delivered more than once.
 *   To dedupe, persist processed `svix-id` headers (or `email_id`) and skip repeats.
 * - Missing Svix headers or bad signatures: we return 4xx so bogus traffic fails fast.
 *   Resend will retry non-2xx; invalid signatures will never succeed on retry — monitor logs.
 * - `receiving.get` can return null `html` and `text`; we still send a forward with a stub body.
 * - Attachment download failures: we log and omit that file so the forward can still go out.
 * - Very large attachments may hit provider/time limits on serverless; consider raising
 *   `maxDuration` on Vercel if forwards time out.
 * - SPF/DKIM: the visible "From" is your verified domain; original sender is in subject/body
 *   and optional Reply-To, not in SMTP From (expected for forwarding).
 */

const FORWARD_TO = "gentaaiagent@gmail.com";
/** Must be an address on your verified sending domain (trygenta.com). */
const SEND_FROM = "Genta <hello@trygenta.com>";

const MAX_SUBJECT_LEN = 900;
const MAX_FROM_DISPLAY = 200;

export const runtime = "nodejs";

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 3)}...`;
}

function buildForwardSubject(originalFrom: string, originalSubject: string): string {
  const fromPart = truncate(originalFrom.trim() || "(unknown sender)", MAX_FROM_DISPLAY);
  const subj = (originalSubject || "").trim() || "(no subject)";
  const out = `[Inbound · From: ${fromPart}] ${subj}`;
  return out.length > MAX_SUBJECT_LEN ? `${out.slice(0, MAX_SUBJECT_LEN - 3)}...` : out;
}

function extractReplyToAddress(fromHeader: string): string | undefined {
  const angle = fromHeader.match(/<([^>]+)>/);
  if (angle) {
    const inner = angle[1].trim();
    if (inner.length > 0) return inner;
  }
  const t = fromHeader.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return t;
  return undefined;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMetaBlockText(email: {
  from: string;
  to: string[];
  cc: string[] | null;
  created_at: string;
  message_id: string;
}): string {
  const lines = [
    "— Forwarded via hello@trygenta.com (Resend inbound) —",
    `Original From: ${email.from}`,
    `Original To: ${email.to.join(", ")}`,
    ...(email.cc && email.cc.length > 0 ? [`Cc: ${email.cc.join(", ")}`] : []),
    `Date: ${email.created_at}`,
    `Message-ID: ${email.message_id}`,
    "",
  ];
  return lines.join("\n");
}

function buildMetaBlockHtml(email: {
  from: string;
  to: string[];
  cc: string[] | null;
  created_at: string;
  message_id: string;
}): string {
  const ccRow =
    email.cc && email.cc.length > 0
      ? `<tr><td><strong>Cc</strong></td><td>${escapeHtml(email.cc.join(", "))}</td></tr>`
      : "";
  return `
<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;margin-bottom:16px;padding:12px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa">
  <p style="margin:0 0 8px;color:#666">Forwarded via <code>hello@trygenta.com</code> (Resend inbound)</p>
  <table style="border-collapse:collapse">
    <tr><td style="padding:2px 12px 2px 0;vertical-align:top"><strong>From</strong></td><td>${escapeHtml(email.from)}</td></tr>
    <tr><td style="padding:2px 12px 2px 0;vertical-align:top"><strong>To</strong></td><td>${escapeHtml(email.to.join(", "))}</td></tr>
    ${ccRow}
    <tr><td style="padding:2px 12px 2px 0;vertical-align:top"><strong>Date</strong></td><td>${escapeHtml(email.created_at)}</td></tr>
    <tr><td style="padding:2px 12px 2px 0;vertical-align:top"><strong>Message-ID</strong></td><td style="word-break:break-all">${escapeHtml(email.message_id)}</td></tr>
  </table>
</div>`.trim();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!apiKey || !webhookSecret) {
    console.error("[email-inbound] Missing RESEND_API_KEY or RESEND_WEBHOOK_SECRET");
    return new NextResponse("Server misconfiguration", { status: 500 });
  }

  const resend = new Resend(apiKey);

  let payload: string;
  try {
    payload = await req.text();
  } catch (e) {
    console.error("[email-inbound] Failed to read body:", e);
    return new NextResponse("Invalid body", { status: 400 });
  }

  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");

  if (!id || !timestamp || !signature) {
    return new NextResponse("Missing Svix webhook headers", { status: 400 });
  }

  let event: ReturnType<typeof resend.webhooks.verify>;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    });
  } catch (e) {
    console.error("[email-inbound] Webhook verification failed:", e);
    return new NextResponse("Invalid signature", { status: 401 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true, skipped: true, reason: "unsupported event type" });
  }

  const emailId = event.data.email_id;

  const { data: email, error: emailError } = await resend.emails.receiving.get(emailId);

  if (emailError || !email) {
    console.error("[email-inbound] receiving.get failed:", emailError?.message ?? "no data");
    return new NextResponse("Failed to load received email", { status: 502 });
  }

  const { data: attachmentsResult, error: attachmentsError } =
    await resend.emails.receiving.attachments.list({ emailId });

  if (attachmentsError) {
    console.error("[email-inbound] attachments.list failed:", attachmentsError.message);
  }

  const attachments: Attachment[] = [];
  const rows = attachmentsResult?.data ?? [];
  for (const row of rows) {
    try {
      const res = await fetch(row.download_url);
      if (!res.ok) {
        console.warn("[email-inbound] attachment download failed:", row.id, res.status);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      attachments.push({
        filename: row.filename || "attachment",
        content: buf.toString("base64"),
        contentType: row.content_type,
      });
    } catch (e) {
      console.warn("[email-inbound] attachment error:", row.id, e);
    }
  }

  const metaText = buildMetaBlockText({
    from: email.from,
    to: email.to,
    cc: email.cc,
    created_at: email.created_at,
    message_id: email.message_id,
  });

  const metaHtml = buildMetaBlockHtml({
    from: email.from,
    to: email.to,
    cc: email.cc,
    created_at: email.created_at,
    message_id: email.message_id,
  });

  const textPart = email.text?.trim()
    ? email.text
    : "(No plain text body was available for this message.)";
  const htmlPart = email.html?.trim()
    ? email.html
    : "<p><em>(No HTML body was available for this message.)</em></p>";

  const forwardSubject = buildForwardSubject(email.from, email.subject);
  const replyTo = extractReplyToAddress(email.from);

  const { data: sent, error: sendError } = await resend.emails.send({
    from: SEND_FROM,
    to: [FORWARD_TO],
    subject: forwardSubject,
    text: `${metaText}\n---\n\n${textPart}`,
    html: `${metaHtml}<hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>${htmlPart}`,
    replyTo: replyTo ? [replyTo] : undefined,
    attachments: attachments.length > 0 ? attachments : undefined,
  });

  if (sendError) {
    console.error("[email-inbound] resend.emails.send failed:", sendError.message);
    return new NextResponse("Forward send failed", { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    received_email_id: emailId,
    forwarded_id: sent?.id,
  });
}
