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

Apply the schema to your linked project:

```bash
supabase db push
```

### `db push`: “Remote migration versions not found in local migrations directory”

That means the linked project’s migration history (rows in `supabase_migrations.schema_migrations`) references versions that **are not** files under `supabase/migrations/` in this repo—common if the project was used from another machine, the dashboard, or an older CLI layout.

1. **See the mismatch**

   ```bash
   supabase migration list
   ```

   Note every version that appears as applied **remotely** but missing **locally**.

2. **Preferred: align from production**

   ```bash
   supabase db pull
   ```

   Accept prompts to reconcile history. You should get migration file(s) that match what’s already on the server. Then run `supabase db push` again so **`20260404180000_create_genta_waitlist.sql`** applies if the waitlist table is not already in the pulled schema.

3. **Alternative: drop only the ghost history rows** (use when you’re sure the live DB already reflects those old migrations and you don’t have the original SQL files)

   Mark each orphan version **reverted** using the **exact version strings** from `migration list` (ignore error text that puts `--status` first; the CLI expects **versions before the flag**):

   ```bash
   supabase migration repair 20230103054303 20230103054304 --status reverted
   ```

   Repeat until `migration list` is clean, then:

   ```bash
   supabase db push
   ```

4. **Fast unblock (no CLI history fix)**  
   Run the SQL inside `supabase/migrations/20260404180000_create_genta_waitlist.sql` in the Supabase Dashboard **SQL Editor**. Signups work immediately. You should still do step 2 or 3 before relying on `db push` for future migrations.

Optional: `WAITLIST_WEBHOOK_URL` still runs **after** a successful Supabase insert (Slack, Zapier, etc.); webhook failure is logged only so the user still sees success.

## Stack

[Next.js](https://nextjs.org) (App Router), React, TypeScript, Tailwind CSS.
