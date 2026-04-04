import { NextResponse } from "next/server";

const DEFAULT_BASE = "https://www.chatiq.io/api";

const OPTIONAL_FORWARD_KEYS = ["source", "source_detail", "private_mode", "retention_override"] as const;

export async function POST(req: Request) {
  const apiKey = process.env.CHATIQ_API_KEY?.trim();
  const botSlug = process.env.CHATIQ_BOT_SLUG?.trim();
  const base = (process.env.CHATIQ_API_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");

  if (!apiKey || !botSlug) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_SERVER_CONFIG",
          message:
            "Set CHATIQ_API_KEY and CHATIQ_BOT_SLUG in .env.local (see .env.example).",
        },
      },
      { status: 500 },
    );
  }

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
  const isWelcome = o.is_welcome === true;
  const message = typeof o.message === "string" ? o.message : "";

  if (!isWelcome && !message.trim()) {
    return NextResponse.json(
      { error: { code: "MISSING_MESSAGE", message: "Field `message` is required" } },
      { status: 400 },
    );
  }

  if (isWelcome) {
    const upstreamBody: Record<string, unknown> = {
      message: "",
      bot_slug: botSlug,
      is_welcome: true,
      stream: false,
    };
    for (const key of OPTIONAL_FORWARD_KEYS) {
      if (key in o) {
        upstreamBody[key] = o[key];
      }
    }

    const upstream = await fetch(`${base}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(upstreamBody),
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  }

  const conversation_id =
    o.conversation_id === null || o.conversation_id === undefined
      ? null
      : String(o.conversation_id);

  const history = Array.isArray(o.history) ? o.history : [];

  const stream = o.stream !== false;

  const payload: Record<string, unknown> = {
    message: message.trim(),
    bot_slug: botSlug,
    stream,
    conversation_id,
    history,
  };
  for (const key of OPTIONAL_FORWARD_KEYS) {
    if (key in o) {
      payload[key] = o[key];
    }
  }

  const upstream = await fetch(`${base}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  }

  if (!stream) {
    const text = await upstream.text();
    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
