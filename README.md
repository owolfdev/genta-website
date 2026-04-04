# Genta — marketing website

Public marketing site for **Genta**, a local-first desktop AI assistant: chat, tools, and persistent memory on the device by default, with optional cloud and hosted models as upgrades—not prerequisites.

This repo is **not** the Genta desktop app (that ships as a Tauri + Next.js installable); it is the web presence for positioning, landing pages, and campaigns.

## Canonical copy and product context

For messaging guardrails, release boundaries (MVP vs later), telemetry claims, and ICP, use:

[`docs/marketing_assistant_knowledge.md`](docs/marketing_assistant_knowledge.md)

## Development

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Waitlist (Supabase)

Signups go to **`genta_waitlist`** via `POST /api/waitlist` using the **service role** on the server (`SUPABASE_SERVICE_ROLE_KEY`). Copy [`.env.example`](.env.example) to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` plus the service role key.

The waitlist dialog shows policy copy and a **[Privacy Policy](/privacy)** link (new tab); joining the waitlist or choosing to chat is treated as agreement for recording purposes. The policy page is a **template**: have it reviewed by counsel for your jurisdictions. Set **`PRIVACY_POLICY_VERSION`** (e.g. a date string) so stored signups record which version the user saw.

This repo does **not** ship Supabase CLI migrations for now; schema is applied in the Supabase **SQL Editor** when needed.

Reference DDL (idempotent: `if not exists` / `add column if not exists`) is in [`supabase/waitlist_schema.sql`](supabase/waitlist_schema.sql) — table, privacy columns, indexes, RLS. Paste or run that file in the SQL Editor to create or align `genta_waitlist`.

Optional: `WAITLIST_WEBHOOK_URL` still runs **after** a successful Supabase insert (Slack, Zapier, etc.); webhook failure is logged only so the user still sees success.

## Stack

[Next.js](https://nextjs.org) (App Router), React, TypeScript, Tailwind CSS.
