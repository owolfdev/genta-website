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

Open [http://localhost:3000](http://localhost:3000) for the marketing landing (waitlist + link to chat). The interactive terminal lives at [`/chat`](http://localhost:3000/chat). The shell persists ChatIQ’s `conversationId` and the visible user/bot transcript in **`localStorage`** (`genta.chatiq.session.v1`) so a return visit restores the thread and skips the welcome.

The landing page highlights product benefits from `shellConfig` (`WAITLIST_OVERLAY.benefits`).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Waitlist (Supabase)

Signups go to **`genta_waitlist`** via `POST /api/waitlist` using the **service role** on the server (`SUPABASE_SERVICE_ROLE_KEY`). Copy [`.env.example`](.env.example) to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` plus the service role key.

The landing page and the in-chat waitlist overlay share the same policy copy and **[Privacy Policy](/privacy)** link; joining the waitlist or using chat is treated as agreement for recording purposes. The live policy is published at `/privacy` (Genta, trygenta.com, Bangkok — see that page for contact email). Set **`PRIVACY_POLICY_VERSION`** (e.g. a date string) so stored signups record which version the user saw. Update the policy page and version when offerings or regions change.

This repo does **not** ship Supabase CLI migrations for now; schema is applied in the Supabase **SQL Editor** when needed.

Reference DDL (idempotent: `if not exists` / `add column if not exists`) is in [`supabase/waitlist_schema.sql`](supabase/waitlist_schema.sql) — table, privacy columns, indexes, RLS. Paste or run that file in the SQL Editor to create or align `genta_waitlist`.

Contact messages from [`/contact`](http://localhost:3000/contact) go to **`genta_contact_messages`** via `POST /api/contact` (same Supabase service role). Run [`supabase/genta_contact_messages_schema.sql`](supabase/genta_contact_messages_schema.sql) to create **`genta_projects`** (seed row `slug = genta`) and **`genta_contact_messages`** with `project_id` FK, `read` / `responded`, and indexes aligned with your other contact tables. Optional env **`GENTA_CONTACT_PROJECT_ID`** overrides the default UUID if your database already uses a different project row.

Optional: `WAITLIST_WEBHOOK_URL` still runs **after** a successful Supabase insert (Slack, Zapier, etc.); webhook failure is logged only so the user still sees success.

## Stack

[Next.js](https://nextjs.org) (App Router), React, TypeScript, Tailwind CSS.
