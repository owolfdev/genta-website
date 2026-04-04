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

The waitlist UI requires agreement to the **[Privacy Policy](/privacy)** (opens in a new tab from the dialog). The policy page is a **template**: have it reviewed by counsel for your jurisdictions. Set **`PRIVACY_POLICY_VERSION`** (e.g. a date string) so stored signups record which version the user saw.

Waitlist schema for this app lives in **one** migration: `supabase/migrations/20260404180000_genta_waitlist.sql` (table, privacy columns, indexes, RLS). It is **idempotent** (`if not exists` / `add column if not exists`). If you created the table earlier by hand, you can still run that file in the SQL editor to align columns.

Apply via CLI when migration history matches:

```bash
supabase db push
```

### Shared Supabase project (two apps, one database)

Migration history is **per project**, not per app. This repo includes **`001_shared_project_peer_placeholder.sql` … `018_…`** — no-op stubs so local files match versions **001–018** already recorded on the shared remote (from your other app). They do **not** recreate that app’s schema; **do not** run a full migration chain on an empty database without that app’s real SQL.

Then **`20260404180000_genta_waitlist.sql`** is this site’s migration. After stubs are committed, run:

```bash
supabase migration list   # Local and Remote columns should align for 001–018
supabase db push          # Applies 20260404180000 if not yet on remote (often a no-op if you created the table in SQL Editor)
```

**Shell gotchas**

- Do not paste placeholder text like `<exact versions>` — the shell treats `<` as redirection (`zsh: no such file or directory: exact`).
- **`supabase migration repair` argument order** is **`repair <versions…> --status reverted`**, not `repair --status reverted 001 …` (the error hint is backwards for some CLI versions).

**Alternatives (coordinate with the other app’s owners)**

1. Replace the stub files with **real** copies of the other repo’s `001`–`018` SQL (same names), if you want local files to match what actually ran.

2. **Repair** remote history instead of stubs (does not undo schema):  
   `supabase migration repair 001 002 … 018 --status reverted`  
   then `db push` — only if everyone agrees those rows can be removed from history.

3. **`supabase db pull`** — another way to sync local files to remote; review with your team before committing.

### Fast unblock (no CLI)

Run the contents of `supabase/migrations/20260404180000_genta_waitlist.sql` in the Supabase **SQL Editor**. Fix CLI history when you can so `db push` stays usable.

Optional: `WAITLIST_WEBHOOK_URL` still runs **after** a successful Supabase insert (Slack, Zapier, etc.); webhook failure is logged only so the user still sees success.

## Stack

[Next.js](https://nextjs.org) (App Router), React, TypeScript, Tailwind CSS.
